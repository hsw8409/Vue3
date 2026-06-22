
<template>
    <div id="container">
        <!--- S : 검색조건 -->
        <div class="M_SearchBox">
            <ul class="SearchInner">
                <li>
                    <div class="FindWrap2">
                        <div class="form_wrap mr10">
                            <!-- <div class="form_wrap"> -->
                            <label class="" style="width: 120px;">상품코드/명</label>
                            <span class="form_cell form_input search">
                                <input type="text" placeholder="Search"
                                    @keydown.enter="popupHandler({ componentType: 'UIITM04', props: inCustParam, ok: inCustParamOk, value: $event.target.value })"
                                    v-model="inCustParam.sellerCustCd"
                                    @focus="Object.assign(inCustParam, { sellerCustCd: '', sellerCustNm: '' })" />
                                <button class="btn_input input_search"
                                    @click="popupHandler({ componentType: 'UICSTP01', props: inCustParam, ok: inCustParamOk })">
                                    <span class="a11y">검색</span>
                                </button>
                            </span>
                        </div>
                        <div class="form_wrap">
                            <span style="display:inline-block; width: 144px;"> </span>
                            <span class="form_cell form_input">
                                <input type="text" placeholder="코드를 입력하세요" v-model="inCustParam.sellerCustNm" readonly />
                            </span>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <div class="select_wrap">
                            <label>물류센터</label>
                            <div class="select-custom">
                                <select class="select w160" v-model="inCustParam.outWhCustCd">
                                    <option v-for="i in outWhCustCdSelect" :key="i.dtlCommCd" :value="i.dtlCommCd">{{ i.dtlCommNm }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <div class="select_wrap">
                            <label>생산센터</label>
                            <div class="select-custom">
                                <select class="select w160" v-model="inCustParam.inWhCustCd">
                                    <option v-for="i in inWhCustCdSelect" :key="i.dtlCommCd" :value="i.dtlCommCd">{{ i.dtlCommNm }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <label>지시일자</label>
                        <span class="form_cell form_input">
                            <div class="datePickerClass" id="mobileDate">
                                <Datepicker v-model="inCustParam.prodReqDate" :locale="koreaDate" :weekStartsOn="0" inputFormat="yyyy-MM-dd" />
                            </div>
                        </span>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <label>지시완료일자</label>
                        <span class="form_cell form_input">
                            <div class="datePickerClass" id="mobileDate">
                                <Datepicker v-model="inCustParam.prodCompDate" :locale="koreaDate" :weekStartsOn="0" inputFormat="yyyy-MM-dd" />
                            </div>
                        </span>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <div class="select_wrap">
                            <label>공정유형</label>
                            <div class="select-custom">
                                <select class="select w160" v-model="inCustParam.processTypeCd">
                                    <option v-for="i in EAT601" :key="i.dtlCommCd" :value="i.dtlCommCd">{{ i.dtlCommNm }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <div class="select_wrap">
                            <label>전달사항</label>
                            <input v-model="inCustParam.note" />
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
            <button type="button" class="default mob_default ml5" @click="createOrder">
                <span>지시 생성</span>
            </button>
        </div>
        <!--- E : 버튼 -->

        <!--  S : AUI Grid -->
        <div id="auiGrid" class="mobile">
            <AUIGrid ref="myGrid" :columnLayout="columnLayout" :gridProps="gridProps" @cellClick="retrieveDetail" />
        </div>
        <!--  E : AUI Grid -->
    </div>
</template>
<script setup>
import AUIGrid from "@/static/AUIGrid-Vue.js/AUIGrid.vue";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import Datepicker from "vue3-datepicker";
import { ko } from 'date-fns/locale';
import moment from "moment";
import api from "@/common/axios/api";

//공통코드
const EAT601 = JSON.parse(localStorage.getItem("EAT601")); // 공정유형

const whCenterList = [
    { custCd: 0, custNm: '강릉센터' },
    { custCd: 1, custNm: '반품' },
]
const myGrid = ref(null)
const koreaDate = ref(ko);
const outWhCustCdSelect = [
    { dtlCommCd: '1000076', dtlCommNm: '물류센터' },
]
const inWhCustCdSelect = [
    { dtlCommCd: '1000084', dtlCommNm: '생산센터' },
]
const procStatFgSelect = [
    { dtlCommCd: 0, dtlCommNm: '등록' },
    { dtlCommCd: 1, dtlCommNm: '지시확정' },
    { dtlCommCd: 2, dtlCommNm: '공업진행' },
    { dtlCommCd: 3, dtlCommNm: '생산확정' },
    { dtlCommCd: 9, dtlCommNm: '취소' }
]
const labelFunction = (data, value) => {
    const result = data.filter(val => val.dtlCommCd == value)
    if (result.length === 0) return value
    return result[0].dtlCommNm
}
/** 팝업 핸들러 */
const instance = getCurrentInstance();
const popup = instance.appContext.config.globalProperties.$popup;
const popupHandler = ({ type = "search" || "mobileAlert" || "mobileConfirm", componentType = null, msg = null, props, ok, cancel, value }) => {
    switch (componentType) {
        case 'UICSTP01':
            Object.assign(inCustParam, {
                ...inCustParam,
                custCd: value,
            })
        default:
            popup({
                type,
                msg,
                componentType,
                props,
                ok,
                cancel
            })
    }
}


const gridProps = {
    noDataMessage: "출력할 데이터가 없습니다.",
    rowHeight: 40,

    height: 480,
    headerHeight: 40
}
// 그리드 칼럼 레이아웃
const columnLayout = [
    { dataField: "prodReqDate", headerText: "지시일자", width: 80, },
    { dataField: "sellerCustNm", headerText: "매출처", style: "gridTextAlignLeft"},
    {
        dataField: "processTypeCd", headerText: "지시유형", width: 80,
        labelFunction: (rowIndex, columnIndex, value, headerText, item) => labelFunction(EAT601, value),
    },
    { dataField: "cnt", headerText: "상품<br>건수", width: 35, },
    { dataField: "procStatFg", headerText: "진행상태", width: 55,
        labelFunction: (rowIndex, columnIndex, value, headerText, item) => labelFunction(procStatFgSelect, value),
    }
]

const inCustParamOk = param => {
    Object.assign(inCustParam, {
        sellerCustCd: param[0].custCd,
        sellerCustNm: param[0].custNm,
    })
}

const inCustParamState = {
    sellerCustCd: '',
    sellerCustNm: '',
    outWhCustCd: null,  //물류센터(out)
    outWhCustNm: null,
    inWhCustCd: null,   //생산센터(in)
    inWhCustNm: null,
    prodReqDate: new Date(),
    prodCompDate: new Date(),
    processTypeCd: '10',
    note: ''
}
const oriCustParamState = {
    purchCustCd: null,
    purchCustNm: null,
    inWhCustCd: null,
    inWhCustNm: null,
    custCd: null,
    custTypeCd: 100,
    searchDate: new Date(),
}
const inCustParam = reactive({ ...inCustParamState })
const oriCustParam = reactive({ ...oriCustParamState })

/** 조회 */
const retrieve = () => {
    const params = {
        ...inCustParam,
        //searchDate: moment(inCustParam.searchDate).format('YYYYMMDD'),
    };
    
    Object.assign(params, {prodReqDate: moment(inCustParam.prodReqDate).format('YYYYMMDD')});
    Object.assign(params, {prodCompDate: moment(inCustParam.prodCompDate).format('YYYYMMDD')});
    myGrid.value.showAjaxLoader();
    api.post("/api/v1/biz/request/selectProductOrder", params)
        .then(res => res?.result)
        .then(res => {
            Object.assign(oriCustParam, inCustParam)
            return res
        })
        .then(myGrid.value.setGridData)
        .then(myGrid.value.removeAjaxLoader)
        .catch(console.error)
};

/** 지시생성 */
const createOrder = () => {
    /*
    if (!inCustParam.sellerCustCd) {
        popup({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: "매출처를 등록해주세요.",
        });
        return false;
    }
    */
    const params = {
        ...inCustParam,
        //searchDate: moment(inCustParam.searchDate).format('YYYYMMDD'),
    };

    Object.assign(params, {prodReqDate: moment(inCustParam.prodReqDate).format('YYYYMMDD')});
    Object.assign(params, {prodCompDate: moment(inCustParam.prodCompDate).format('YYYYMMDD')});

    myGrid.value.showAjaxLoader();
    api.post("/api/v1/biz/request/insertProductOrder", params)
        .then(res => res?.result)
        .then(res => {
            Object.assign(oriCustParam, inCustParam)
            return res
        })
        .then(() => retrieve()) //비동기 재조회
        .then(myGrid.value.removeAjaxLoader)
        .catch(console.error)
};

const emit = defineEmits(["goPage"]);
const emitParam = reactive({
    target: {
        _value: "UI_MOB_005P01",
    },
    props: {
    }
})

/** 상세 조회 */
const retrieveDetail = e => {
    Object.assign(emitParam.props, {
        slipNo: myGrid.value.getCellValue(e.rowIndex, 'slipNo'),
        sellerCustCd: myGrid.value.getCellValue(e.rowIndex, 'sellerCustCd'),
        sellerCustNm: myGrid.value.getCellValue(e.rowIndex, 'sellerCustNm'),
        inWhCustCd: myGrid.value.getCellValue(e.rowIndex, 'inWhCustCd'),
        inWhCustNm: myGrid.value.getCellValue(e.rowIndex, 'inWhCustNm'),
        processTypeCd: myGrid.value.getCellValue(e.rowIndex, 'processTypeCd'),
    })
    emit("goPage", emitParam);
}

onMounted(() => {
})
</script>