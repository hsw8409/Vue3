<script setup lang="ts">
/*
 * @file     UI_ITM_P01.vue
 * @menu     품목 선택 팝업
 * @author   astems
 * @since    2026-07-03
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
import ItemCategory from '@/components/search/ItemCategory.vue';

import { usePopupStore } from '@/common/stores/popup';
import { useCommonCodeStore } from '@/common/stores/commonCode';

import { selectPopupItem } from '@/api/item'; //backend

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

// 품목코드/명 포커스 변수
const itemCdRef = ref<any>(null);

// 품목분류
const categoryParam = ref({
    lclsItemCd: '',
    mclsItemCd: '',
    sclsItemCd: '',
});

// 그리드
const myGrid = ref<AUIGridProps | null>(null);

const commonCodeStore = useCommonCodeStore();
const EAT450 = computed(() => commonCodeStore.getCode('EAT450')); // 재고관리기준
const GLB200 = computed(() => commonCodeStore.getCode('GLB200')); // 거래상태
const GLB450 = computed(() => commonCodeStore.getCode('GLB450')); // 품목유형
const GLB500 = computed(() => commonCodeStore.getCode('GLB500')); // 보관온도
const GLB800 = computed(() => commonCodeStore.getCode('GLB800')); // 표준분류코드
const GLB550 = computed(() => commonCodeStore.getCode('GLB550')); // 자타사구분 (Y : 자사, N : 타사)

const popupStore = usePopupStore();

// ==================================================
// 그리드 영역
// ==================================================

const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withShowRowCheckColumn(props.param?.isMulti)
    .withExtraProps({ height: 460 })
    .build();

// 세금구분, 규격, 원산지, 매입단가, 판매단가, 기본단위, 수발주단위, 발주단위수량, 소수점구분, 품목유형, 품목등급
const columnLayout = [
    { dataField: 'itemCd', headerText: t('item.label.itemCode') }, // 품목코드
    {
        dataField: 'itemNm',
        headerText: t('item.label.itemName'),
        style: 'gridTextAlignLeft',
        width: '30%',
    }, // 품목명칭
    {
        dataField: 'keepTempGbnCd',
        headerText: t('item.label.storageTemperature'), // 보관온도
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
                GLB500.value.map((item: any) => [item.dtlCommCd, item.dtlCommNm]),
            );
            return columnValue.get(_value) ?? '';
        },
    },
    {
        dataField: 'invMngStdCd',
        headerText: t('item.label.stockManageStandard'), // 재고관리기준
        style: 'gridTextAlignLeft',
        width: '20%',
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
                EAT450.value.map((item: any) => [item.dtlCommCd, item.dtlCommNm]),
            );
            return columnValue.get(_value) ?? '';
        },
    },
    { dataField: 'buyerId', headerText: t('item.label.assignBuyer'), style: 'gridTextAlignLeft' }, // 담당바이어
    {
        dataField: 'tranStatCd',
        headerText: t('customer.label.tradeStatus'), // 거래상태
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
                GLB200.value.map((item: any) => [item.dtlCommCd, item.dtlCommNm]),
            );
            return columnValue.get(_value) ?? '';
        },
    },
    {
        dataField: 'cowPigGbnFg',
        headerText: t('item.label.standardClassCode'), // 표준분류코드
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
                GLB800.value.map((item: any) => [item.dtlCommCd, item.dtlCommNm]),
            );
            return columnValue.get(_value) ?? '';
        },
    },
];

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

// 초기화
const reset = () => {
    Object.assign(searchParameter.value, props.param);

    categoryParam.value = {
        lclsItemCd: '',
        mclsItemCd: '',
        sclsItemCd: '',
    };
};

// 조회 버튼
const search = function () {
    const params = {
        ...searchParameter.value,
        ...categoryParam.value,
        show: props.param.show,
    };

    selectPopupItem(params)
        .then((res) => {
            // 그리드 데이터 삽입
            myGrid.value?.setGridData(res?.data?.result ?? []);
        })
        .catch((e) => {
            popupStore.alert(e.message);
        });
};

// 행 더블클릭 이벤트
const rowSelect = async (event: any) => {
    popupStore.closePopup(props.id, event.item);
};

// 선택
const select = async () => {
    const item = props.param?.isMulti
        ? myGrid.value?.getCheckedRowItemsAll()
        : myGrid.value?.getSelectedRows();

    if (!item || item.length === 0) {
        popupStore.alert(t('com.message.selectItemL', [t('com.label.item')]));
        return;
    }

    popupStore.closePopup(props.id, item);
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
onMounted(() => {
    searchParameter.value.itemCd = props.param.itemCd || '';
    searchParameter.value.show = props.param.show || '';
    if (searchParameter.value.itemCd) {
        search();
    }

    itemCdRef.value.setFocus();
});
</script>

<template>
    <div id="main">
        <div id="container" class="popupContent">
            <div class="titleWrap">
                <div class="pageTitle">
                    <!--품목정보-->
                    <h2>{{ t('item.label.itemInfo') }}</h2>
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
                            <!-- 품목코드/명 -->
                            <ComInputbox
                                ref="itemCdRef"
                                v-model="searchParameter.itemCd"
                                :label="t('item.label.itemCodeAndName')"
                                :maxlength="50"
                                @enter="search"
                            />
                        </div>
                    </li>
                    <!-- 대분류, 중분류, 소분류 -->
                    <ItemCategory v-model="categoryParam" />
                    <li>
                        <div class="search_container">
                            <!-- 표준분류 -->
                            <ComSelectbox
                                v-model="searchParameter.cowPigGbnFg"
                                :label="t('item.label.standardClass')"
                                :select-type="'A'"
                                :options="GLB800"
                            />
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!-- 품목유형 -->
                            <ComSelectbox
                                v-model="searchParameter.itemTypeCd"
                                :label="t('item.label.itemType')"
                                :select-type="'A'"
                                :options="GLB450"
                            />
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!-- 자/타사구분 -->
                            <ComSelectbox
                                v-model="searchParameter.selfThirdYn"
                                :label="t('item.label.companyType')"
                                :select-type="'A'"
                                :options="GLB550"
                            />
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!-- 보관온도 -->
                            <ComSelectbox
                                v-model="searchParameter.keepTempGbnCd"
                                :label="t('item.label.storageTemperature')"
                                :select-type="'A'"
                                :options="GLB500"
                            />
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!-- 거래상태 -->
                            <ComSelectbox
                                v-model="searchParameter.tranStatCd"
                                :label="t('customer.label.tradeStatus')"
                                :select-type="'A'"
                                :options="GLB200"
                            />
                        </div>
                    </li>
                </ul>
            </div>

            <!--- E : 검색조건 -->
            <!--  S : AUI Grid -->
            <!-- 품목목록 -->
            <h3>{{ t('item.label.itemList') }}</h3>
            <div id="auiGrid">
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
