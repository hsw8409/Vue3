<script setup lang="ts">
/*
 * @file     UI_CST_P01.vue
 * @menu     거래처 선택 팝업
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, onMounted, computed } from 'vue';
import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps, type AUIGridProps } from '@/static/AUIGrid/AUIGridDefault';

import { useI18n } from 'vue-i18n'; // 다국어

import ComSelectbox from '@/components/form/ComSelectbox.vue'; // 선택박스 box
import ComInputbox from '@/components/form/ComInputbox.vue'; // 텍스트 box
import ComButton from '@/components/form/ComButton.vue';

import { usePopupStore } from '@/common/stores/popup';
import { useCommonCodeStore } from '@/common/stores/commonCode';

import { selectPopupCustomerList } from '@/api/customer'; //backend
import { utils } from '@/common/utils';

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

const searchParameter = ref({
    ...(props.param ?? {}),
});
const custCdRef = ref<any>(null);

const commonCodeStore = useCommonCodeStore();
const GLB150 = computed(() => commonCodeStore.getCode('GLB150'));

const popupStore = usePopupStore();
// ==================================================
// 그리드 영역
// ==================================================

// 그리드
const myGrid = ref<AUIGridProps | null>(null);

const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({ height: 530 })
    .build();
const columnLayout = [
    { dataField: 'custCd', headerText: t('customer.label.custCode'), width: '7%' }, // 거래처코드
    {
        dataField: 'custNm',
        headerText: t('customer.label.custName'),
        style: 'gridTextAlignLeft',
    }, // 거래처명
    {
        dataField: 'bizerNm',
        headerText: t('customer.label.businessName'),
        style: 'gridTextAlignLeft',
    }, // 사업자명
    {
        dataField: 'custTypeCd',
        headerText: t('customer.label.custType'), // 거래처유형
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            const columnValue = new Map(
                GLB150.value.map((item: any) => [item.dtlCommCd, item.dtlCommNm]),
            );
            return columnValue.get(_value) ?? '';
        },
    },
    {
        dataField: 'bizerNo',
        headerText: t('customer.label.businessNumber'), // 사업자번호
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            return _value
                ?.replace(/\D/g, '')
                .slice(0, 10)
                .replace(/(\d{1,3})(\d{1,2})(\d{1,5})/, '$1-$2-$3');
        },
    },
    {
        dataField: 'telNo',
        headerText: t('com.label.telNo'), // 전화번호
        width: '10%',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            const digitsOnly = _value?.replace(/\D/g, '');
            if (!digitsOnly) {
                return '';
            }
            return utils.stringUtil.getFormatTelNo(digitsOnly); // 번화번호 유효성
        },
    },
];

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

// 초기화
const reset = () => {
    Object.assign(searchParameter.value, {
        custCd: '',
        ownerNm: '',
        bizerNo: '',
        custTypeCd: props.param.custTypeCd ?? '',
    });
};

// 조회
const search = () => {
    const params = {
        ...searchParameter.value,
        show: props.param.show,
    };

    selectPopupCustomerList(params)
        .then((res) => {
            // 그리드 데이터 삽입
            myGrid.value?.setGridData(res?.data?.result || []);
        })
        .catch((e) => {
            popupStore.alert(e.message);
        });
};

// 선택
const select = async () => {
    const [item] = myGrid.value?.getSelectedRows() || [];

    if (!item) {
        popupStore.alert(t('com.message.selectItemL', [t('com.label.cust')]));
        return;
    }

    popupStore.closePopup(props.id, item);
};

// 행 더블클릭 이벤트
const rowSelect = async (event: any) => {
    popupStore.closePopup(props.id, event.item);
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================

onMounted(() => {
    searchParameter.value.custCd = props.param.custCd || '';
    searchParameter.value.custTypeCd = props.param.custTypeCd || '';
    searchParameter.value.userTypeCd = props.param.userTypeCd || '';
    searchParameter.value.ownerNm = '';
    searchParameter.value.bizerNo = '';

    search();

    // 거래처명 포커스 맞추기
    custCdRef.value.setFocus();
});
</script>

<template>
    <div class="popup-main">
        <div class="popup-container">
            <div class="titleWrap">
                <div class="pageTitle">
                    <!--거래처정보-->
                    <h2>{{ t('customer.label.custInfo') }}</h2>
                </div>

                <div class="btn_area">
                    <!-- 초기화 -->
                    <ComButton :text="t('com.label.reset')" @click="reset" />
                    <!-- 조회 -->
                    <ComButton :text="t('com.label.search')" @click="search" />
                    <!-- 선택 -->
                    <ComButton :text="t('com.label.select')" @click="select" />
                </div>
            </div>

            <!--- S : 검색조건 -->
            <div class="SearchBox popup_search">
                <ul class="SearchInner">
                    <li>
                        <div class="search_container">
                            <!--거래처명-->
                            <ComInputbox
                                ref="custCdRef"
                                v-model="searchParameter.custCd"
                                :label="t('customer.label.custName')"
                                :maxlength="50"
                                @enter="search"
                            />
                        </div>
                    </li>
                    <li>
                        <div ref="custTypeCdRef" class="search_container">
                            <!-- 거래처유형 -->
                            <ComSelectbox
                                v-model="searchParameter.custTypeCd"
                                :disabled="!!props.param.custTypeCd"
                                :label="t('customer.label.custType')"
                                :select-type="'A'"
                                :options="GLB150"
                            />
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!--대표자명-->
                            <ComInputbox
                                v-model="searchParameter.ownerNm"
                                :label="t('com.label.ownerName')"
                                :maxlength="50"
                                @enter="search"
                            />
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!--사업자번호-->
                            <ComInputbox
                                v-model="searchParameter.bizerNo"
                                :label="t('customer.label.businessNumber')"
                                :maxlength="50"
                                @enter="search"
                            />
                        </div>
                    </li>
                </ul>
            </div>
            <!--- E : 검색조건 -->

            <!--  S : AUI Grid -->

            <!--거래처정보-->
            <div id="popup-grid">
                <AUIGrid
                    ref="myGrid"
                    :column-layout="columnLayout"
                    :grid-props="gridProps"
                    @cell-double-click="rowSelect"
                />
            </div>
            <!--  E : AUI Grid -->
        </div>
    </div>
</template>
