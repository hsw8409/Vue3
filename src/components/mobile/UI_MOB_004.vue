<!--
 * @file     \components\mobile\UI_MOB_004.vue
 * @menu     메인 - 재고실사
 * @author   HJY
 * @since    2025-10-24
 * @version  1.0
 * 
 * @description 
 * 모바일실사화면
-->
<script setup>
// ||==================================================||
// ||import 영역                                        ||
// ||==================================================||
import { ref, getCurrentInstance, onMounted, inject } from "vue";
import AUIGrid from "@/static/AUIGrid-Vue.js/AUIGrid.vue";
import { AUIGridDefault } from "@/common/utils/AUIGridDefault";
import { biz } from "@/common/utils/biz";
import { ko } from "date-fns/locale";
import moment from "moment";
import { useI18n } from "vue-i18n"; // 다국어
import DateSelectInput from "@/components/template/etc/DateSelectInput.vue"; // 달력
import PopupMenuButton from "@/components/template/button/PopupMenuButton.vue"; // 팝업메뉴버튼
import ComboSelectInput from "@/components/template/combo/ComboSelectInput.vue"; // 텍스트박스
import TextBoxInput from "@/components/template/text/TextBoxInput.vue"; // 텍스트박스
import CustomButton from "@/components/template/button/CustomButton.vue"; // 사용자정의버튼
import { selectWHCenterGroup /*물류콤보*/, insertAdjustList /*실사생성*/, stockTakingSelectLclsList /*대분류콤보박스*/, stocktakingSelectItemList /*ti_item 품목조회*/, selectAdjust /*전체목록조회*/, saveAdjustConfirm /*실사확정*/, stockTakingScanRemoveAll /*실사삭제*/ } from "@/api/mobile";


// ||=====================================================||
// ||변수 선언 영역                                         ||
// ||=====================================================||
const props = defineProps({
    menuInfo: {
        type: Object,
        required: false,
    },
    param: ref(),
});

// 메세지 변수
const { t } = useI18n();

// 팝업
const popupHandler = inject("popupHandler");

let param = {
    target: {
        _value: "UI_MOB_004P01",
    },
    props: {
        realDate: "",
        lclsItemCd: "",
        whCustCd: "",
        realTypeGbnFg: "",
        confYn: "",
    },
};
const emit = defineEmits(["goPage"]);
const pageClick = function (event) {
    param.props.lclsItemCd = event.item.lclsItemCd;
    param.props.realTypeGbnFg = event.item.realTypeGbnFg;
    param.props.confYn = event.item.confYn;
    emit("goPage", param);
};

/**체크박스 단일 */
const checkBox = (event) => {
    // 확정 상태일 때는 편집 불가
    if (event.item.confYn == "Y") {
        return;
    }

    myGrid1.value.setAllCheckedRows(false); // 모든 체크박스 해제 (현재 클릭한 행 포함)
    if (event.checked) {
        myGrid1.value.addCheckedRowsByIds(event.item._$uid); // 선택 행 체크
    }
};

// 현재 컴포넌트 인스턴스 가져오기
const instance = getCurrentInstance();
// $api와 같은 전역 속성에 접근
const api = instance.appContext.config.globalProperties.$api;
const popup = instance.appContext.config.globalProperties.$popup;

const myGrid1 = ref(null);
const pickedDate = ref(new Date());
const koreaDate = ref(ko);
const center = ref(null);
const selectedCenter = ref(null);
const forInsertCenter = ref(null);
const forInsertDate = ref(null);
const centerNm = ref("");
const lclsItem = ref(null);
const selectedLcls = ref(null);
const showDate = ref("");
const retrieveCount = ref(0);
const searchItemCd = ref("");
const searchItem = ref("");
const labelFg = {
    lcls: "",
    whCust: "",
    item: "",
};

const COM014 = JSON.parse(localStorage.getItem("COM014")); // 재고확정여부

const centerList = async () => {
    try {
        const res = await selectWHCenterGroup({});
        center.value = res?.result.map((v) => ({ ...v, dtlCommCd: v.custCd, dtlCommNm: v.custNm }));
        selectedCenter.value = res?.result[0].custCd;
        labelFg.whCust = res?.result;

        return true;

    } catch (e) {
        popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("com.message.errorOccurred", [`${t("adjust.label.logisticsCenter") /*물류센터*/} ${t("com.label.search") /*조회*/}`]) /*{0} 중 오류가 발생했습니다.*/
        });
        return false;

    }
};

const lclsList = async () => {
    try {
        const res = await stockTakingSelectLclsList({});
        labelFg.lcls = res?.result;
        lclsItem.value = [
            {
                dtlCommCd: "M",
                dtlCommNm: t("adjust.label.itemAdjust") /*단품실사*/
            },
            ...res?.result.map((v) => ({ ...v, dtlCommCd: v.lclsItemCd, dtlCommNm: v.lclsItemNm }))
        ];

        return true;

    } catch (e) {
        popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("com.message.errorOccurred", [`${t("item.label.lclsInfo") /*대분류정보*/} ${t("com.label.search") /*조회*/}`]) /*{0} 중 오류가 발생했습니다.*/
        });
        return false;

    }
};

const itemList = async () => {
    try {
        const res = await stocktakingSelectItemList({});
        labelFg.item = res?.result;

        return true;

    } catch (e) {
        popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("com.message.errorOccurred", [`${t("item.label.itemInfo") /*품목정보*/} ${t("com.label.search") /*조회*/}`]) /*{0} 중 오류가 발생했습니다.*/
        });
        return false;

    }
};

// ||==================================================||
// ||그리드 영역                                         ||
// ||==================================================||
// 그리드
const gridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        // height: 490,
        height: "100%",
        showRowCheckColumn: true, // 체크박스 표시 설정
        showRowAllCheckBox: false,
        showStateColumn: true,
        showRowNumColumn: false,
        autoScrollSize: true,
        rowCheckableFunction: (rowIndex, isChecked, item) => {
            // 개별 체크박스 제약 조건 설정 - 이 함수는 사용자가 체크박스를 클릭 할 때 1번 호출됩니다.
            return item.confYn != "Y";
        },
        rowCheckDisabledFunction: (rowIndex, isChecked, item) => {
            // 체크박스 disable스타일 - false 반환하면 disabled 처리됨
            return item.confYn != "Y";
        },
    })
    .build();
const columnLayout1 = [
    {
        dataField: "lclsItemCd",
        headerText: `${t("com.label.audit")}${t("com.label.target")}` /*실사대상*/,
        width: "21%",
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
            let columnValue;
            labelFg.lcls.forEach(function (code) {
                if (code.lclsItemCd == value) {
                    columnValue = code.lclsItemNm;
                }
                if (value == "*") {
                    columnValue = t("com.label.all") /*전체*/;
                }
                // else if (item.realTypeGbnFg == 'M') {
                //   columnValue = "단품실사";
                // }
            });
            labelFg.item.forEach(function (code) {
                if (code.itemCd == value) {
                    columnValue = code.itemNm;
                }
            });
            return columnValue;
        },
    },
    { dataField: "countItem", headerText: `${t("com.label.goods")}${t("com.label.cnt")}` /*상품건수*/, width: "21%" },
    {
        dataField: "confDate",
        headerText: t("logistics.label.approveDate" /*확정일자*/),
        headerText: t("logistics.label.approveDate" /*확정일자*/),
        width: "35%",
        dataType: "date",
        dateInputFormat: "yyyymmdd", // 데이터의 날짜 형식
        formatString: "yyyy-mm-dd", // 그리드에 보여줄 날짜 형식
    },
    {
        dataField: "confYn",
        headerText: t("com.label.approvalYn" /*확정여부*/),
        width: "23%",
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
            let columnValue;
            COM014.forEach(function (code) {
                if (code.dtlCommCd == value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    },
];

// ||==================================================||
// ||사용자 정의 함수 영역                                ||
// ||==================================================||
const search = async () => {
    const searchRealDate = moment(pickedDate.value).format("YYYYMMDD");

    const validationPolicies = [
        {
            name: t("adjust.label.logisticsCenter"), /*물류센터*/
            value: selectedCenter.value,
            required: true,
        },
        {
            name: t("adjust.label.auditDate"), /*실사일자*/
            value: searchRealDate,
            required: true,
        },
    ];

    if (!(await biz.validateBeforeSubmit(validationPolicies, t, popupHandler))) {
        return;
    }

    const grid = myGrid1.value;
    grid.showAjaxLoader();

    const params = {
        realDate: searchRealDate,
        whCustCd: selectedCenter.value
    };
    selectAdjust(params)
        .then((res) => {
            // console.log(res);
            // 그리드 데이터 삽입
            grid.setGridData(res?.result);
            grid.removeAjaxLoader();
            forInsertCenter.value = selectedCenter.value;
            forInsertDate.value = searchRealDate;
            for (let i = 0; i < labelFg.whCust.length; i++) {
                if (labelFg.whCust[i].custCd == forInsertCenter.value) {
                    centerNm.value = labelFg.whCust[i].custNm;
                }
            }
            const year = forInsertDate.value.substr(0, 4);
            const month = forInsertDate.value.substr(4, 2);
            const day = forInsertDate.value.substr(6, 2);
            showDate.value = year + "-" + month + "-" + day;
            param.props.whCustCd = forInsertCenter.value;
            param.props.realDate = forInsertDate.value;
            retrieveCount.value++;
        })
        .catch((e) => {
            grid.removeAjaxLoader();
        });
};
const newPopup = () => {
    let lclsCd;

    if (retrieveCount.value == 0) {
        popup({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("com.message.proceedAfterSearch"), // 조회 후 작업을 진행하여 주세요.
        });
        return false;
    }
    const today = moment(new Date()).format("YYYYMMDD");
    const compareDate = moment(forInsertDate.value).format("YYYYMMDD");
    if (today != compareDate) {
        popup({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("adjust.message.onlyTodayDate", [t("com.label.create")]), // 당일일자만 생성 가능합니다.
        });
        return false;
    }

    if (selectedLcls.value == null) {
        lclsCd = "*";
    } else if (selectedLcls.value == "M") {
        // 단품실사
        lclsCd = searchItem.value;
    } else {
        lclsCd = selectedLcls.value;
    }
    const grid = myGrid1.value;
    const columnData = grid.getColumnValues("lclsItemCd");

    for (let i = 0; i < columnData.length; i++) {
        if (lclsCd == columnData[i]) {
            popup({
                type: "mobileAlert",
                componentType: "mobileMsg",
                msg: t("adjust.message.alreadyRegisteredAudit"), // 이미 등록된 실사가 있습니다.
            });
            return false;
        }
    }
    popup({
        type: "mobileConfirm",
        componentType: "mobileMsg",
        msg: t("com.message.confirmCreate"), // 생성하시겠습니까?
        ok: () => {
            realNew(lclsCd);
        },
        cancel: "",
    });
};
const realNew = (cd) => {
    let typeGbnFg;
    if (selectedLcls.value == null) {
        //전체실사
        typeGbnFg = "A";
    } else if (selectedLcls.value == "M") {
        //단품실사
        typeGbnFg = "M";
    } else {
        typeGbnFg = "C"; //대분류코드
    }

    const params = { realDate: forInsertDate.value, whCustCd: forInsertCenter.value, realTypeGbnFg: typeGbnFg, lclsItemCd: cd };

    insertAdjustList(params)
        .then((res) => {
            popup({
                type: "mobileAlert",
                componentType: "mobileMsg",
                msg: t("com.message.created"), // 생성되었습니다.
            });
            search();
        })
        .catch((e) => { });
};
const beforeConfirm = () => {
    if (retrieveCount.value == 0) {
        popup({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("com.message.proceedAfterSearch"), // 조회 후 작업을 진행하여 주세요.
        });
        return false;
    }

    const checkedRow = myGrid1.value.getCheckedRowItemsAll();
    if (checkedRow.length == 0) {
        popup({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("analysis.message.noTargetItem"), // 대상 품목이 없습니다.
        });
        return false;
    }

    if (myGrid1.value.getCheckedRowItemsAll().length > 1) {
        return popup({ type: "mobileAlert", componentType: "mobileMsg", msg: t("adjust.message.onlyOnePossible") }); // 한 건만 선택해주세요.
    }

    const today = moment(new Date()).format("YYYYMMDD");
    const compareDate = moment(forInsertDate.value).format("YYYYMMDD");
    if (today != compareDate) {
        popup({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("adjust.message.onlyTodayDate", [t("com.label.approval")]), // 당일일자만 확정 가능합니다.
        });
        return false;
    }
    if (checkedRow[0].confYn == "Y") {
        popup({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("adjust.message.alreadyApprovedAudit"), // 이미 확정된 실사입니다.
        });
        return false;
    }
    popup({
        type: "mobileConfirm",
        componentType: "mobileMsg",
        msg: t("com.message.confirmApprove"), // 확정하시겠습니까?
        ok: () => saveConfirm(),
    });
};
const saveConfirm = () => {
    const checkedRow = myGrid1.value.getCheckedRowItemsAll();
    const realDate = checkedRow[0].realDate;
    const whCustCd = checkedRow[0].whCustCd;
    const lclsItemCd = checkedRow[0].lclsItemCd;
    const realTypeGbnFg = checkedRow[0].realTypeGbnFg;

    const params = { realDate: realDate, whCustCd: whCustCd, lclsItemCd: lclsItemCd, realTypeGbnFg: realTypeGbnFg };

    saveAdjustConfirm(params)
        .then((res) => {
            popup({
                type: "mobileAlert",
                componentType: "mobileMsg",
                msg: t("com.message.approved"), // 확정되었습니다.
            });
            search();
        })
        .catch((e) => { });
};

const searchParameter = ref({
    itemCd: "",
    itemNm: "",
    lclsItemCd: "",
    mclsItemCd: "",
    sclsItemCd: "",
    itemTypeCd: "",
    selfThirdYn: "",
    invMngStdCd: "",
    tranStatCd: "",
});
const popup_itm = () => {
    searchParameter.value.itemCd = searchItemCd.value;
    popup({
        type: "search",
        componentType: "UIITMP04",
        style: {
            width: 350,
            height: 700,
        },
        props: searchParameter.value,
        ok: callbackOk,
        cancel: callbackCancel,
    });
};
const callbackOk = function (param) {
    searchParameter.value = param;
    searchItemCd.value = param[0].itemNm;
    searchItem.value = param[0].itemCd;

    callbackCancel();
};
const callbackCancel = function () {
    searchParameter.value = {
        itemCd: "",
        lclsItemCd: "",
        mclsItemCd: "",
        sclsItemCd: "",
        itemTypeCd: "",
        selfThirdYn: "",
        invMngStdCd: "",
        tranStatCd: "",
    };
};

/**바코드 전체 삭제 */
const scanRemoveAll = () => {
    if (myGrid1.value.getCheckedRowItemsAll().length == 0) {
        return popup({ type: "mobileAlert", componentType: "mobileMsg", msg: t("com.message.noCheckedAttribute") }); // 체크된 항목이 없습니다.
    }

    if (myGrid1.value.getCheckedRowItemsAll().length > 1) {
        return popup({ type: "mobileAlert", componentType: "mobileMsg", msg: t("adjust.message.onlyOnePossible") }); // 한 건만 선택해주세요.
    }

    const checkedRow = myGrid1.value.getCheckedRowItemsAll();
    const realDate = checkedRow[0].realDate;
    const whCustCd = checkedRow[0].whCustCd;
    const lclsItemCd = checkedRow[0].lclsItemCd;
    const realTypeGbnFg = checkedRow[0].realTypeGbnFg;

    const removeAllOk = () => {
        //purchCustCd, itemCd, barcodNo, distrHistoryNo
        const params = { realDate: realDate, whCustCd: whCustCd, lclsItemCd: lclsItemCd, realTypeGbnFg: realTypeGbnFg };
        stockTakingScanRemoveAll(params)
            .then((res) => {
                popup({ type: "alert", msg: res?.result.errMsg });
                // 재조회
                if (res?.result.errCd == "00") {
                    search();
                }
            })
            .catch((e) => { });
    };

    popup({ type: "mobileConfirm", componentType: "mobileMsg", msg: t("com.message.confirmDelete") /*삭제하시겠습니까?*/, ok: () => removeAllOk() });
};
// ||==================================================||
// ||Hook 영역                                          ||
// ||==================================================||
onMounted(async () => {
    const [whCustReady, itemLclsReady, itemInfoReady] = await Promise.all([
        centerList(),
        lclsList(),
        itemList(),
    ]);

    // 물류센터, 대분류, 품목정보를 모두 정상적으로 가져온 경우에만 조회
    if (whCustReady && itemLclsReady && itemInfoReady) {
        search();
    }
});
</script>

<template>
    <div id="container" class="poAbsolMView">
        <!--- S : 검색조건 -->
        <div class="M_SearchBox">
            <ul class="SearchInner">
                <li>
                    <div class="form_wrap">
                        <div class="select_wrap">
                            <label style="min-width: 49px;">{{ t("adjust.label.logisticsCenter") /*물류센터*/ }}</label>
                            <div class="select-custom">
                                <ComboSelectInput v-model="selectedCenter"
                                    :params="{ selectType: '', divClass: 'select-custom', selectClass: 'select ww160' }"
                                    :options="center" />
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <label style="min-width: 49px;">{{ t("adjust.label.auditDate") /*실사일자*/ }}</label>
                        <span class="form_cell form_input">
                            <div class="datePickerClass ww160" id="mobileDate">
                                <DateSelectInput v-model="pickedDate" :weekStartsOn="0" inputFormat="yyyy-MM-dd" />
                            </div>
                        </span>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <div class="select_wrap">
                            <label style="min-width: 49px;">{{ t("item.label.lcls") /*대분류*/ }}</label>
                            <ComboSelectInput v-model="selectedLcls"
                                :params="{ selectType: 'A', divClass: 'select-custom', selectClass: 'select ww160' }"
                                :options="lclsItem" @update:modelValue="
                                    () => {
                                        searchItemCd = '';
                                    }
                                " />
                            <span class="form_cell form_input search ml5" v-if="selectedLcls == 'M'">
                                <TextBoxInput v-model="searchItemCd" :params="{ label: '', inputClass: 'w110' }"
                                    maxlength="10" @keydown.enter="popup_itm" :style="{ width: '80%' }" />
                                <CustomButton :params="{ name: '', buttonClass: 'btn_input input_search' }"
                                    @click="popup_itm" />
                            </span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <!--- E : 검색조건 -->

        <!--- S : 버튼 -->
        <div class="btn_area_m mb10">
            <PopupMenuButton :params="{ name: t('com.label.search') /*조회*/, buttonClass: 'mob_default' }"
                @click="search" />
            <PopupMenuButton :params="{ name: t('com.label.create') /*생성*/, buttonClass: 'mob_default ml5' }"
                @click="newPopup" />
            <PopupMenuButton :params="{ name: t('com.label.approval') /*확정*/, buttonClass: 'mob_default ml5' }"
                @click="beforeConfirm" />
            <PopupMenuButton :params="{ name: t('com.label.del') /*삭제*/, buttonClass: 'mob_default ml5' }"
                @click="scanRemoveAll" />
        </div>
        <!--- E : 버튼 -->

        <!--  S : AUI Grid -->
        <span class="realDate mb10">
            <span class="arrImg"></span>
            <span class="showDate"> {{ t("adjust.label.auditDate") /*실사일자*/ }} : {{ showDate }} </span>
            <span class="displayFlex"> {{ t("adjust.label.logisticsCenter") /*물류센터*/ }} : {{ centerNm }} </span>
        </span>
        <div id="auiGrid" class="mobile">
            <AUIGrid ref="myGrid1" :columnLayout="columnLayout1" :gridProps="gridProps" @cellClick="pageClick"
                @rowCheckClick="checkBox" />
        </div>

        <!--  E : AUI Grid -->
    </div>
</template>
