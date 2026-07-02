<script setup lang="ts">
/*
 * @file     UI_MOB_002.vue
 * @menu     모바일입고
 * @author   astems
 * @since    2026-07-01
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, reactive } from 'vue';

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps } from '@/static/AUIGrid/AUIGridDefault';

import DatePeriod from '@/components/search/DatePeriod.vue'; // 날짜기간
import CustCdAndNameSearch from '@/components/search/CustCdAndNameSearch.vue';
import { usePopupStore } from '@/common/stores/popup';
import { mobilePurchaseList } from '@/api/mobile';

import dayjs from 'dayjs';
// ==================================================
// 변수 선언 영역
// ==================================================

// 메인화면은 필수 - 메뉴정보를 받기 위한 props
defineProps<{
    menuInfo: any;
    params: Record<string, any>;
}>();

const myGrid = ref<any>(null);

const COM110 = JSON.parse(localStorage.getItem('COM110') ?? '[]');
const COM101 = JSON.parse(localStorage.getItem('COM101') ?? '[]');

const popup = usePopupStore();

const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: 400,
        selectionMode: 'singleRow', // 셀 선택모드
    })
    .build();
// 그리드 칼럼 레이아웃
const columnLayout = [
    { dataField: 'slipNo', headerText: '전표번호' },
    {
        dataField: 'ordGbnFg',
        headerText: '반품여부',
        width: 60,
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            value: string,
            _headerText: string,
            _item: any,
        ) {
            //rowIndex, columnIndex, value, headerText, item
            let columnValue;
            COM110.forEach(function (code: any) {
                if (code.dtlCommCd == value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    },
    { dataField: 'targetCnt', headerText: '상품건수', width: 60 },
    {
        dataField: 'procStatFg',
        headerText: '확정여부',
        width: 60,
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            value: string,
            _headerText: string,
            _item: any,
        ) {
            //rowIndex, columnIndex, value, headerText, item
            let columnValue;
            COM101.forEach(function (code: any) {
                if (code.dtlCommCd == value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    },
];

const inCustParamState = {
    purchCustCd: null,
    purchCustNm: null,
    inWhCustCd: null,
    inWhCustNm: null,
    custCd: null,
    custTypeCd: 100,
    searchDate: new Date(),
};
const oriCustParamState = {
    purchCustCd: null,
    purchCustNm: null,
    inWhCustCd: null,
    inWhCustNm: null,
    custCd: null,
    custTypeCd: 100,
    searchDate: new Date(),
};
const inCustParam = reactive({ ...inCustParamState });
const oriCustParam = reactive({ ...oriCustParamState });

/** 조회 */
const retrieve = () => {
    if (inCustParam.purchCustCd === null) return popup.alert('매입처 검색 후 조회 해주세요');

    // 시작날짜, 마지막날짜
    const params = {
        ...inCustParam,
        searchDate: dayjs(inCustParam.searchDate).format('YYYYMMDD'),
    };

    myGrid.value.showAjaxLoader();
    mobilePurchaseList(params)
        .then((res) => res?.data?.result)
        .then((res) => {
            Object.assign(oriCustParam, inCustParam);
            return res;
        })
        .then(myGrid.value.setGridData)
        .then(myGrid.value.removeAjaxLoader)
        .catch(console.error);
};

const emit = defineEmits(['goPage']);
const emitParam = reactive({
    target: {
        _value: 'UI_MOB_002P01',
    },
    props: {
        slipNo: null,
        purchCustCd: null,
        purchCustNm: null,
        inWhCustCd: null,
        inWhCustNm: null,
        searchDate: dayjs(new Date()).format('YYYYMMDD'),
    },
});

/** 상세 조회 */
const retrieveDetail = (e: any) => {
    Object.assign(emitParam.props, {
        slipNo: myGrid.value.getCellValue(e.rowIndex, 'slipNo'),
        purchCustCd: oriCustParam.purchCustCd,
        purchCustNm: oriCustParam.purchCustNm,
        inWhCustCd: oriCustParam.inWhCustCd,
        inWhCustNm: oriCustParam.inWhCustNm,
        searchDate: dayjs(oriCustParam.searchDate).format('YYYYMMDD'),
    });
    emit('goPage', emitParam);
};
</script>

<template>
    <div id="container">
        <!--- S : 검색조건 -->
        <div class="M_SearchBox">
            <ul class="SearchInner">
                <li>
                    <div class="FindWrap2">
                        <div class="form_wrap mr10">
                            <CustCdAndNameSearch ref="custCdInputRef" v-model="inCustParam" />
                        </div>
                        <div class="form_wrap">
                            <span style="display: inline-block; width: 144px"></span>
                            <span class="form_cell form_input">
                                <input
                                    v-model="inCustParam.purchCustNm"
                                    type="text"
                                    placeholder="코드를 입력하세요"
                                    readonly
                                />
                            </span>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <DatePeriod
                            v-model="inCustParam.searchDate"
                            :params="{ label: '입고일자' }"
                            start-dt-key="searchDateStart"
                            end-dt-key="searchDateEnd"
                        />
                    </div>
                </li>
            </ul>
        </div>
        <!--- E : 검색조건 -->
        <!--- S : 버튼 -->
        <div class="btn_area_m mb20">
            <button type="button" class="default mob_default" @click="retrieve">
                <span>조회</span>
            </button>
        </div>
        <!--- E : 버튼 -->

        <!--  S : AUI Grid -->
        <span class="realDate mb10">
            <span class="arrImg"></span>
            <span class="showDate">
                입고일자 : {{ dayjs(oriCustParam.searchDate).format('YYYY.MM.DD') }}
            </span>
            <span class="displayFlex">물류센터 : {{ oriCustParam.inWhCustNm }}</span>
        </span>
        <div id="auiGrid" class="mobile">
            <AUIGrid
                ref="myGrid"
                :column-layout="columnLayout"
                :grid-props="gridProps"
                @cell-click="retrieveDetail"
            />
        </div>
        <!--  E : AUI Grid -->
    </div>
</template>
