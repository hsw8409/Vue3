<!--
 * @file     \views\device\UI_DVC_005.vue
 * @menu     모바일 생산
 * @author   HJY
 * @since    2025-10-23
 * @version  1.0
 * 
 * @description 
 * EAT700 dtl_comm_cd = '19' 에 해당하는 (장문)문구를 관리하는 화면
-->
<script setup>
// ||==================================================||
// ||import 영역                                        ||
// ||==================================================||
import { getCurrentInstance, onMounted, onBeforeMount, reactive, ref, computed } from "vue";

import { biz } from "@/common/utils/biz"; // 공통 utils
import { useI18n } from "vue-i18n"; // 다국어

import AUIGrid from "@/static/AUIGrid-Vue.js/AUIGrid.vue";
import { ko } from "date-fns/locale";
import moment from "moment";

import CheckBoxSelect from "@/components/template/checkbox/CheckBoxSelect.vue"; // 체크박스
import ComboSelect from "@/components/template/combo/ComboSelect.vue"; // 체크박스
import DateSelectInput from "@/components/template/etc/DateSelectInput.vue"; // 텍스트입력(입력용)
import PopupMenuButton from "@/components/template/button/PopupMenuButton.vue"; // 팝업메뉴버튼

import { selectOutWhCustList /*물류센터목록*/, selectProductOrderMobile /*조회*/, selectInWhCustList /*생산센터목록*/ } from "@/api/mobile";
// ||=====================================================||
// ||변수 선언 영역                                         ||
// ||=====================================================||
// 메인화면은 필수 - 메뉴정보를 받기 위한 props
const props = defineProps({
    menuInfo: {
        type: Object,
        required: false,
    },
});

// 메세지 변수
const { t } = useI18n();

const locale = reactive(ko);
//공통코드
const EAT601 = JSON.parse(localStorage.getItem("EAT601")); // 공정유형
const COM102 = JSON.parse(localStorage.getItem("COM102")); // 생산진행상태

const myGrid = ref(null);
const koreaDate = ref(ko);
const outWhCustCdSelect = ref([
    // { dtlCommCd: '1000076', dtlCommNm: '물류센터' },
]);
const inWhCustCdSelect = ref([
    // { dtlCommCd: '1000084', dtlCommNm: '생산센터' },
]);
const labelFunction = (data, value) => {
    const result = data.filter((val) => val.dtlCommCd == value);
    if (result.length === 0) return value;
    return result[0].dtlCommNm;
};
/** 팝업 핸들러 */
const instance = getCurrentInstance();
const popup = instance.appContext.config.globalProperties.$popup;
const popupHandler = ({ type = "search" || "mobileAlert" || "mobileConfirm", componentType = null, msg = null, props, ok, cancel, value }) => {
    switch (componentType) {
        case "UICSTP01":
            Object.assign(inCustParam, {
                ...inCustParam,
                custCd: value,
            });
        default:
            popup({
                type,
                msg,
                componentType,
                props,
                ok,
                cancel,
            });
    }
};

const inCustParamState = {
    sellerCustCd: "",
    sellerCustNm: "",
    outWhCustCd: null, //물류센터(out)
    outWhCustNm: null,
    inWhCustCd: null, //생산센터(in)
    inWhCustNm: null,
    prodReqDate: new Date(),
    prodCompDate: new Date(),
    searchDate: new Date(),
    processTypeCd: "",
    note: "",
    searchType: "req", // "req" 또는 "comp"
    periodChecked: false,
};
const oriCustParamState = {
    sellerCustCd: "",
    sellerCustNm: "",
    outWhCustCd: null, //물류센터(out)
    outWhCustNm: null,
    inWhCustCd: null, //생산센터(in)
    inWhCustNm: null,
    custCd: null,
    custTypeCd: 100,
    searchDate: new Date(),
    searchStartDate: null,
    searchEndDate: null,
    periodChecked: false,
};
const inCustParam = reactive({ ...inCustParamState });
const oriCustParam = reactive({ ...oriCustParamState });

const emit = defineEmits(["goPage"]);
const emitParam = reactive({
    target: {
        _value: "UI_MOB_005P01",
    },
    props: {},
});

// ||==================================================||
// ||그리드 영역                                         ||
// ||==================================================||
const gridProps = {
    noDataMessage: t("com.message.noDataOutput"),//출력할 데이터가 없습니다.
    rowHeight: 40,

    // height: 554,
    height: "100%",
    headerHeight: 40,
};
// 그리드 칼럼 레이아웃
const columnLayout = [
    {
        dataField: "prodReqDate",
        headerText: t("request.label.instructionDate") /*지시일자*/,
        width: 80,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item, dataField, cItem) {
            if (!value) {
                return "";
            }
            return `${value?.slice(0, 4)}-${value?.slice(4, 6)}-${value?.slice(6, 8)}`;
        },
    },
    { dataField: "sellerCustNm", headerText: t("com.label.salesCust") /*매출처*/, style: "gridTextAlignLeft" },
    {
        dataField: "processTypeCd",
        headerText: t("request.label.instructionType") /*지시유형*/,
        width: 80,
        labelFunction: (rowIndex, columnIndex, value, headerText, item) => labelFunction(EAT601, value),
    },
    { dataField: "cnt", headerText: `${t("com.label.goods")}<br>${t("com.label.cnt")}` /*상품/n건수*/, width: 35 },
    {
        dataField: "procStatFg",
        headerText: t("dashboard.label.progressState") /*진행상태*/,
        width: 55,
        labelFunction: (rowIndex, columnIndex, value, headerText, item) => labelFunction(COM102, value),
    },
];

// ||==================================================||
// ||사용자 정의 함수 영역                                ||
// ||==================================================||
/**datepicker날짜변경 */
const handleModelValueUpdate = () => {
    document.getElementById("retrieveBtn").focus();
    search();
};
const isChecked = () => {
    search();
};

/** 조회 */
const search = () => {
    const params = {
        ...inCustParam,
        prodReqDate: moment(inCustParam.prodReqDate).format("YYYYMMDD"),
    };
    myGrid.value.showAjaxLoader();
    selectProductOrderMobile(params)
        .then((res) => res?.result)
        .then((res) => {
            Object.assign(oriCustParam, inCustParam);
            return res;
        })
        .then(myGrid.value.setGridData)
        .then(myGrid.value.removeAjaxLoader)
        .catch(console.error);
};

/** 상세 조회 */
const searchDetail = (e) => {
    Object.assign(emitParam.props, {
        slipNo: myGrid.value.getCellValue(e.rowIndex, "slipNo"),
        prodReqDate: myGrid.value.getCellValue(e.rowIndex, "prodReqDate"),
        sellerCustCd: myGrid.value.getCellValue(e.rowIndex, "sellerCustCd"),
        sellerCustNm: myGrid.value.getCellValue(e.rowIndex, "sellerCustNm"),
        inWhCustCd: myGrid.value.getCellValue(e.rowIndex, "inWhCustCd"),
        inWhCustNm: myGrid.value.getCellValue(e.rowIndex, "inWhCustNm"),
        outWhCustCd: myGrid.value.getCellValue(e.rowIndex, "outWhCustCd"),
        processTypeCd: myGrid.value.getCellValue(e.rowIndex, "processTypeCd"),
        procStatFg: myGrid.value.getCellValue(e.rowIndex, "procStatFg"),
        wmRemark: myGrid.value.getCellValue(e.rowIndex, "wmRemark"),
        groupSlipNo: myGrid.value.getCellValue(e.rowIndex, "groupSlipNo"),
    });
    emit("goPage", emitParam);
};

// ||==================================================||
// ||Hook 영역                                          ||
// ||==================================================||
onBeforeMount(() => {
    let grid = myGrid.value;
    //물류창고
    selectOutWhCustList({})
        .then((res) => res?.result)
        .then((res) => {
            outWhCustCdSelect.value = res.map((v) => ({
                dtlCommCd: v.custCd,
                dtlCommNm: v.custNm,
            }));

            if (outWhCustCdSelect.value.length === 1) {
                console.log("outWhCustCdSelect.value[0].dtlCommCd", outWhCustCdSelect.value[0].dtlCommCd);
                inCustParam.outWhCustCd = outWhCustCdSelect.value[0].dtlCommCd;
            }
            return res;
        })
        .catch(console.error);
    //생산센터
    selectInWhCustList({})
        .then((res) => res?.result)
        .then((res) => {
            inWhCustCdSelect.value = res.map((v) => ({
                dtlCommCd: v.custCd,
                dtlCommNm: v.custNm,
            }));
            if (inWhCustCdSelect.value.length === 1) {
                inCustParam.inWhCustCd = inWhCustCdSelect.value[0].dtlCommCd;
            }
            return res;
        })
        .catch(console.error);
});
onMounted(() => {
    search();
});
</script>

<template>
    <div id="container" class="poAbsolMView">
        <!--- S : 검색조건 -->
        <div class="M_SearchBox">
            <ul class="SearchInner">
                <li>
                    <div class="form_wrap">
                        <label>{{ t("request.label.instructionDate") /*지시일자*/ }}</label>
                        <div class="datePickerClass mr10" id="w160Date">
                            <span class="form_cell form_input ww160">
                                <DateSelectInput v-model="inCustParam.prodReqDate" />
                            </span>
                        </div>
                        <div class="form_wrap">
                            <CheckBoxSelect v-model="inCustParam.periodChecked" :params="{ label: t('mobile.label.inclueds10Days') /*10일내포함*/, labelFor: 'isSlipBySlip' }" @change="isChecked" />
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <div class="select_wrap">
                            <label>{{ t("device.label.processType") /*공정유형*/ }}</label>
                            <ComboSelect v-model="inCustParam.processTypeCd" :params="{ label: null, selectType : 'A', divClass: 'select-custom', selectClass: 'select ww160' }" :options="EAT601" />
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <!--- E : 검색조건 -->

        <!--- S : 버튼 -->
        <div class="btn_area_m mb10">
            <PopupMenuButton :params="{ name: t('com.label.search') /*조회*/, buttonClass: 'mob_default' }" @click="search" />
        </div>
        <!--- E : 버튼 -->

        <!--  S : AUI Grid -->
        <div id="auiGrid" class="mobile">
            <AUIGrid ref="myGrid" :columnLayout="columnLayout" :gridProps="gridProps" @cellClick="searchDetail" />
        </div>
        <!--  E : AUI Grid -->
    </div>
</template>
