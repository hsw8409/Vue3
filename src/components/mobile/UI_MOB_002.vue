<!-- 모바일입고 -->
<script setup>
import AUIGrid from '@/static/AUIGrid-Vue.js/AUIGrid.vue';
import { getCurrentInstance, onMounted, reactive, ref, inject } from 'vue';
import Datepicker from 'vue3-datepicker';
import { ko } from 'date-fns/locale';
import moment from 'moment';
import api from '@/common/axios/api';

let grid;
const myGrid = ref(null);
const koreaDate = ref(ko);
const ordGbnFgSelect = JSON.parse(localStorage.getItem('COM110')); // 주문구분
const procStatFgSelect = JSON.parse(localStorage.getItem('COM101')); // 구매진행상태

const labelFunction = (data, value) => {
    const result = data.filter((val) => val.dtlCommCd == value);
    if (result.length === 0) return value;
    return result[0].dtlCommNm;
};
/** 팝업 핸들러 */
const instance = getCurrentInstance();
const popup = instance.appContext.config.globalProperties.$popup;
const popupHandler = inject('popupHandler');
// const popupHandler = ({ type = "search" || "mobileAlert" || "mobileConfirm", componentType = null, msg = null, props, ok, cancel, value }) => {
//     switch (componentType) {
//         case 'UICSTP01':
//             Object.assign(inCustParam, {
//                 ...inCustParam,
//                 custCd: value,
//             })
//         default:
//             popup({
//                 type,
//                 msg,
//                 componentType,
//                 props,
//                 ok,
//                 cancel
//             })
//     }
// }

const gridProps = {
    noDataMessage: '출력할 데이터가 없습니다.',
    rowHeight: 40,

    height: 480,
    headerHeight: 40,
};
// 그리드 칼럼 레이아웃
const columnLayout = [
    { dataField: 'slipNo', headerText: '전표번호' },
    // { dataField: "inPlanDate", headerText: "입고일자" },
    // { dataField: "purchCustCd", headerText: "매입처" },
    // { dataField: "inWhCustCd", headerText: "물류센터" },
    {
        dataField: 'ordGbnFg',
        headerText: '반품여부',
        width: 60,
        labelFunction: (rowIndex, columnIndex, value, headerText, item) =>
            labelFunction(ordGbnFgSelect, value),
    },
    { dataField: 'targetCnt', headerText: '상품건수', width: 60 },
    {
        dataField: 'procStatFg',
        headerText: '확정여부',
        width: 60,
        labelFunction: (rowIndex, columnIndex, value, headerText, item) =>
            labelFunction(procStatFgSelect, value),
    },
];

const inCustParamOk = (param) => {
    Object.assign(inCustParam, {
        purchCustCd: param[0].custCd,
        purchCustNm: param[0].custNm,
        inWhCustCd: param[0].whcenterCd,
    });
};

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

/** 초기화 */
const resetBtn = () => {
    Object.assign(inCustParam, inCustParamState);
    Object.assign(oriCustParam, oriCustParamState);

    myGrid.value.clearGridData();
};

/** 조회 */
const retrieve = () => {
    if (inCustParam.purchCustCd === null)
        return popupHandler({ type: 'mobileAlert', msg: '매입처 검색 후 조회 해주세요' });
    if ((!inCustParam.searchDate) instanceof Date)
        return popupHandler({ type: 'mobileAlert', msg: '입고일자 선택 후 조회 해주세요' });

    // 시작날짜, 마지막날짜
    const params = {
        ...inCustParam,
        searchDate: moment(inCustParam.searchDate).format('YYYYMMDD'),
    };

    myGrid.value.showAjaxLoader();
    api.post('/api/v1/biz/mobile/mobilePurchaseList', params)
        .then((res) => res?.result)
        .then((res) => {
            Object.assign(oriCustParam, inCustParam);
            return res;
        })
        .then(myGrid.value.setGridData)
        .then(myGrid.value.removeAjaxLoader);
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
        searchDate: moment(new Date()).format('YYYYMMDD'),
    },
});

/** 상세 조회 */
const retrieveDetail = (e) => {
    Object.assign(emitParam.props, {
        slipNo: myGrid.value.getCellValue(e.rowIndex, 'slipNo'),
        purchCustCd: oriCustParam.purchCustCd,
        purchCustNm: oriCustParam.purchCustNm,
        inWhCustCd: oriCustParam.inWhCustCd,
        inWhCustNm: oriCustParam.inWhCustNm,
        searchDate: moment(oriCustParam.searchDate).format('YYYYMMDD'),
    });
    emit('goPage', emitParam);
};

onMounted(() => {
    grid = myGrid.value;

    /** 테스트 */
    inCustParam.inWhCustNm = '임시거래처';
    inCustParam.inWhCustCd = '0000037';
    inCustParam.purchCustCd = '0000025';
    inCustParam.purchCustNm = '도드람';
    inCustParam.searchDate = new Date(2023, 11, 17);

    // retrieve()
});
</script>

<template>
    <div id="container">
        <!--- S : 검색조건 -->
        <div class="M_SearchBox">
            <ul class="SearchInner">
                <li>
                    <div class="FindWrap2">
                        <div class="form_wrap mr10">
                            <!-- <div class="form_wrap"> -->
                            <label class="" style="width: 120px">매입처코드/명</label>
                            <span class="form_cell form_input search">
                                <input
                                    v-model="inCustParam.purchCustCd"
                                    type="text"
                                    placeholder="Search"
                                    @keydown.enter="
                                        popupHandler({
                                            componentType: 'UICSTP01',
                                            props: inCustParam,
                                            ok: inCustParamOk,
                                            value: $event.target.value,
                                        })
                                    "
                                />
                                <button
                                    class="btn_input input_search"
                                    @click="
                                        popupHandler({
                                            componentType: 'UICSTP01',
                                            props: inCustParam,
                                            ok: inCustParamOk,
                                        })
                                    "
                                >
                                    <span class="a11y">검색</span>
                                </button>
                            </span>
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
                        <div class="select_wrap">
                            <label>물류센터</label>
                            <input type="hidden" :name="name" :value="value" />
                            <div class="select-custom">
                                <label style="font-weight: bold; color: brown">
                                    {{ inCustParam.inWhCustNm }}
                                </label>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <label>입고일자</label>
                        <div id="priceDate" class="datePickerClass">
                            <span class="form_cell form_input">
                                <Datepicker
                                    v-model="inCustParam.searchDate"
                                    :locale="koreaDate"
                                    :week-starts-on="0"
                                    input-format="yyyy-MM-dd"
                                />
                            </span>
                        </div>
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
                입고일자 : {{ moment(oriCustParam.searchDate).format('YYYY.MM.DD') }}
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
