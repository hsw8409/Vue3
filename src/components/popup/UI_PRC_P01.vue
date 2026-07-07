<script setup lang="ts">
/*
 * @file     UI_PRC_P01.vue
 * @menu     매입단가 엑셀업로드 선택 팝업
 * @author   astems
 * @since    2026-07-03
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, computed, reactive } from 'vue';
import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps, type AUIGridProps } from '@/static/AUIGrid/AUIGridDefault';

import { useI18n } from 'vue-i18n'; // 다국어

import ComInputbox from '@/components/form/ComInputbox.vue'; // 텍스트 box
import ComButton from '@/components/form/ComButton.vue';

import { usePopupStore } from '@/common/stores/popup';
import { useCommonCodeStore } from '@/common/stores/commonCode';

import { fileService } from '@/common/utils/file';

// api
import { excelUploadValidation } from '@/api/price';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
// 메세지 변수
const { t } = useI18n();

const props = defineProps<{
    id: string;
    param: Record<string, any>;
}>();

const commonCodeStore = useCommonCodeStore();
const COM300 = computed(() => commonCodeStore.getCode('COM300'));

// 파일업로드
const uploadFile = ref<HTMLInputElement | null>(null);
const fileState = {
    name: '',
    fileInput: '',
};
const file = reactive({ ...fileState });

// 확정버튼 유효성
const confirmValidation = ref(0);

const popupStore = usePopupStore();

// =====================================================================================================
// 그리드 영역
// =====================================================================================================

// 컴포넌트 접근을 위한 그리드 Ref 선언
const myGrid = ref<AUIGridProps | null>(null);

// 그리드 설정
const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: 460,
        rowStyleFunction: function (_rowIndex: number, item: any) {
            let rowStyle;
            if (item.procErrCd !== 'ZZ') {
                // 정상이 아니면 빨간 글씨 처리
                rowStyle = 'error-row-style';
            }
            // 로직 처리
            return rowStyle;
        },
    })
    .build();

// 그리드 레이아웃
const columnLayout = [
    {
        dataField: 'procErrCd',
        headerText: t('com.label.result'), // 결과
        width: 120,
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            let returnData = '';
            COM300.value.some(function (item: any) {
                if (item.dtlCommCd == _value) {
                    returnData = item.dtlCommNm;
                }
            });
            return returnData;
        },
    },
    {
        dataField: 'purchPrcGrpCd',
        headerText: t('customer.label.purchaseUnitPriceGroup'),
        width: 120,
        colSpan: 2,
    }, // 매입단가그룹
    {
        dataField: 'purchPrcGrpNm',
        headerText: t('price.label.unitPriceGroupName'),
        style: 'gridTextAlignLeft',
    }, // 단가그룹명
    { dataField: 'itemCd', headerText: t('item.label.itemCode'), width: 120 }, // 품목코드
    {
        dataField: 'itemNm',
        headerText: t('item.label.itemName'),
        style: 'gridTextAlignLeft',
        width: 250,
    }, // 품목명
    { dataField: 'applyStdDate', headerText: t('price.label.applyDate') }, // 적용일자
    {
        dataField: 'applyUnitPrc',
        headerText: t('item.label.purchaseUnitPrice'),
        style: 'gridTextAlignRight',
        dataType: 'numeric',
    }, // 매입단가
];

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

/**
 * 업로드 버튼 클릭 이벤트
 * @author LJY
 * @date 2025.03.19
 */
const fnClickUploadFile = () => {
    uploadFile.value?.click();
};

/**
 * 엑셀양식 업로드 이벤트
 * @author LJY
 * @date 2025.03.19
 */
const fnChangeUpload = async () => {
    const fileObj = uploadFile.value?.files?.[0];
    if (!fileObj) return;

    file.name = fileObj.name;
    confirmValidation.value = 0;

    const jsonData = await fileService.excelToJson(fileObj);

    if (!jsonData || jsonData.length === 0) {
        confirmValidation.value++;
        myGrid.value?.clearGridData();
        return;
    }

    // 🔥 기존 로직 연결
    const paramData = jsonData.map((row: any) => ({
        purchPrcGrpCd: row[t('price.label.unitPriceGroupCode')],
        itemCd: row[t('item.label.itemCode')],
        applyStdDate: row[t('price.label.applyDate')],
        applyUnitPrc: row[t('item.label.purchaseUnitPrice')],
    }));

    const res = await excelUploadValidation(paramData);

    const list = res?.data?.result ?? [];

    const hasError = list.some((item: any) => item.procErrCd !== 'ZZ');

    if (hasError) confirmValidation.value++;

    myGrid.value?.setGridData(list);

    uploadFile.value!.value = '';
};

/**
 * 확정 버튼 클릭 이벤트
 * @author LJY
 * @date 2025.03.21
 */
const fnConfirmClick = function () {
    const data = myGrid.value?.getGridData?.() ?? [];
    popupStore.closePopup(props.id, data);
};

// =====================================================================================================
// HOOK 영역
// =====================================================================================================
</script>

<template>
    <div id="main">
        <div id="container" class="popupContent">
            <div style="position: absolute; top: 0px">
                <!-- 그룹코드, 품목코드, 매입처코드, 적용일자가 동일한 경우에는 엑셀의 맨 마지막 자료로 반영됩니다 -->
                <span style="font-size: 13px; color: red">
                    {{ '* ' + t('price.message.overwriteByLastExcelEntry') }}
                </span>
            </div>
            <div class="titleWrap">
                <div class="pageTitle" style="align-items: flex-start">
                    <!-- 엑셀 업로드 -->
                    <h2>{{ t('com.label.excelUpload') }}</h2>
                </div>
                <div class="form_wrap">
                    <div class="btn_area">
                        <ComInputbox v-model="file.name" readonly />
                        <input
                            ref="uploadFile"
                            type="file"
                            accept=".xlsx,.XLSX"
                            style="display: none"
                            @change="fnChangeUpload"
                        />

                        <!-- 업로드 -->
                        <ComButton :text="t('com.label.upload')" @click="fnClickUploadFile" />

                        <ComButton
                            :text="t('com.label.approval')"
                            :disabled="confirmValidation !== 0 || !file.name"
                            @click="fnConfirmClick"
                        />
                    </div>
                </div>
            </div>

            <!--  S : AUI Grid -->
            <!-- 결과 -->
            <h3>{{ t('com.label.result') }}</h3>
            <div id="auiGrid">
                <AUIGrid ref="myGrid" :column-layout="columnLayout" :grid-props="gridProps" />
            </div>
            <!--  E : AUI Grid -->
        </div>
    </div>
</template>
