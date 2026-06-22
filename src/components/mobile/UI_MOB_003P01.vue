<!--
 * @file     \components\mobile\UI_MOB_003P01.vue
 * @menu     물류/생산 - 장비 - 모바일출고 전표 디테일화면 (메인 - 출고처리 - 조회결과 그리드 셀 누르면 이동)
 * @author   HJY
 * @since    2025-10-29
 * @version  1.0
 * 
 * @description 
 * 모바일 출고 화면에서 전표를 눌러서 진입
 * 바코드 스캔으로 출고
 * 출고확정
-->
<script setup>
// ||==================================================||
// ||import 영역                                        ||
// ||==================================================||
import { computed, getCurrentInstance, onActivated, onMounted, defineEmits, reactive, ref, nextTick, inject } from "vue";
import AUIGrid from "@/static/AUIGrid-Vue.js/AUIGrid.vue";
import { AUIGridDefault } from "@/common/utils/AUIGridDefault";
import api from "@/common/axios/api";
import moment from "moment";
import { useRouter } from "vue-router";
import { ko } from "date-fns/locale";
import { useI18n } from "vue-i18n"; // 다국어

import TextBox from "@/components/template/text/TextBox.vue";
import PopupMenuButton from "@/components/template/button/PopupMenuButton.vue"; // 팝업메뉴버튼
import ComboSelectInput from "@/components/template/combo/ComboSelectInput.vue"; // 텍스트박스
import CheckBoxSelect from "@/components/template/checkbox/CheckBoxSelect.vue"; // 체크박스

import { mobileOrderDetailList /*조회*/, barcodeCheck /*바코드체크*/, mobileOrderBarcode /*출고*/, scanDelete /*출고취소*/, scanSuccess /*기존주문스캔성공*/, scanFail /*신규품목스캔*/, orderConfirm /*출고확정*/, mobileOrderWorker /*담당기사조회*/ } from "@/api/mobile";
// ||=====================================================||
// ||변수 선언 영역                                         ||
// ||=====================================================||
// 메인화면은 필수 - 메뉴정보를 받기 위한 props
const props = defineProps(["props"]);

// 메세지 변수
const { t } = useI18n();

const successAudio = ref();
const errorAudio = ref();
const myGrid = ref(null);
/** 팝업 핸들러 */
const popupHandler = inject("popupHandler");

const emit = defineEmits(["goPage:success"]);

/** Interface */
const inputDataState = {
    barcodeInput: null,
    resultMsg: null,
};
const validateState = {
    deleteFlag: false,
    keyboardFlag: false,
    keyboardText: t("mobile.label.keyboardOn") /*키보드 켜기*/,
};
const inputData = reactive({ ...inputDataState });
const validate = reactive({ ...validateState });
/** 바코드 데이터, props 관리 */
const cacheVariable = reactive({
    params: props.props,
    scanFlag: props.props?.procStatFg == "1" ? false : true,
    worker: null,
    // workerList: {},
    workerList: [],
});
const inplanDate = ref(null);
const check01 = null;
// ||==================================================||
// ||그리드 영역                                         ||
// ||==================================================||
/** 그리드 속성 정의 */
const gridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: 480,
        noDataMessage: t("com.message.noDataOutput"), //"출력할 데이터가 없습니다."
        rowIdField: "rowId",
        rowIdTrustMode: true,
        selectionMode: "singleRow",
        editable: true,
        showFooter: true,
    })
    .build();
/** 그리드 칼럼 레이아웃 */
const columnLayout = [
    // { dataField: "itemCd", headerText: "품목코드", width: 70, },
    { dataField: "itemNm", headerText: t("item.label.itemName") /*품목명*/, style: "gridTextAlignLeft", editable: false },
    { dataField: "purchCustNm", headerText: t("com.label.purchaseCust") /*매입처*/, width: 60, style: "gridTextAlignLeft", editable: false },
    { dataField: "ordQty", headerText: t("com.label.order") /*주문*/, width: 40, dataType: "numeric", formatString: "#,##0", editable: false },
    { dataField: "outQty", headerText: t("com.label.outbound") /*출고*/, width: 40, dataType: "numeric", formatString: "#,##0" },
    {
        dataField: "minusQty",
        headerText: t("com.label.diff") /*차이*/,
        width: 40,
        editable: false,
        dataType: "numeric",
        formatString: "#,##0",
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) => Number(item.outQty) - Number(item.ordQty),
    },
];
const footerLayout = [
    {
        labelText: t("com.label.sum") /*합계*/,
        positionField: "#base",
        style: "aui-grid-my-column",
    },
    {
        dataField: "outQty",
        positionField: "outQty",
        style: "textRight",
        operation: "SUM",
        formatString: "#,##0",
    },
];

// ||==================================================||
// ||사용자 정의 함수 영역                                ||
// ||==================================================||
const successPage = () => {
    emit("goPage:success");
};

/** 키보드 온/오프 */
const keyboardControl = (e) => {
    if (validate.keyboardFlag) validate.keyboardText = t("mobile.label.keyboardOn") /*키보드 켜기*/;
    else validate.keyboardText = t("mobile.label.keyboardOff") /*키보드 끄기*/;
    validate.keyboardFlag = !validate.keyboardFlag;
};

const round = (num, fixed, decimal) => {
    if (decimal) {
        return +(Math.round(num + "e+" + fixed) + "e-" + fixed);
    } else {
        return +(Math.round(num + "e-" + (fixed - 1)) + "e+" + (fixed - 1));
    }
};
/** 스캔시작 */
const scanStart = (e) => document.getElementById("barcodeInput").select();

/** 조회 */
const search = () => {
    myGrid.value.showAjaxLoader();
    mobileOrderDetailList(cacheVariable.params)
        .then((res) => res?.result)
        .then((data) => {
            inplanDate.value = moment(data[0].inPlanDate).format("YYYY-MM-DD");
            myGrid.value.setGridData(data);
        })
        .then(myGrid.value.removeAjaxLoader)
        .then(openMsg)
        .then(() => {
            scanStart();
        })
        .catch(console.error);
};

const xssReturn = (cstMemo, slipMemo) => {
    const safeCst = typeof cstMemo === "string" ? cstMemo : "";
    const safeSlip = typeof slipMemo === "string" ? slipMemo : "";

    const formattedCst = safeCst ? t("com.label.cust") + "- " + safeCst.replaceAll("\n", "<br>") : "";
    const formattedSlip = safeSlip.replaceAll("\n", "<br>");

    if (!formattedCst && !formattedSlip) {
        return t("mobile.message.noMessage"); // 메세지가 없습니다.
    }

    return [formattedCst, formattedSlip].filter(Boolean).join("<br/><br/>");
};
/** openMsg */
const openMsg = () => {
    popupHandler({ type: "mobileAlert", componentType: "mobileMsg", msg: xssReturn(myGrid.value.getGridData()[0].cstRemark, myGrid.value.getGridData()[0].hdRemark) });
};

// 300100100001000
const playAudio = (audio) => {
    if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
        audio.value.play();
    }
};

const loading = ref(false);
const computedStyle = computed(() => {
    return { backgroundColor: loading.value ? "#eee" : "" };
});
/** 바코드 스캔, 스캔할 때 마다 저장 */
const barcodeScan = async (e) => {
    console.log(e);
    loading.value = true;

    try {
        if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(e.target.value)) {
            return Object.assign(inputData, { resultMsg: t("mobile.message.pleaseSwitchToEnglishKeyboard") }); // 영문키보드로 바꿔서 진행해주세요.
        }
        if (e.target.value.trim() === "" || !/^[\da-zA-Z0-9]+$/.test(e.target.value)) {
            return Object.assign(inputData, { resultMsg: t("com.message.barcodeDoesNotExist") }); // 존재하지 않는 바코드입니다.
        }
        // Object.assign(inputData, { barcodeInput: null });

        const params = {
            slipNo: cacheVariable.params?.slipNo,
            sellerCustCd: cacheVariable.params?.sellerCustCd,
            outWhCustCd: cacheVariable.params?.outWhCustCd,
            barcodeNo: e.target.value,
            inPlanDate: moment(cacheVariable.params?.searchDate).format("YYYYMMDD"),
        };

        const barcodeCheckRef = await barcodeCheck(params);
        if (barcodeCheckRef.result > 0 && !validate.deleteFlag) {
            playAudio(errorAudio);
            return Object.assign(inputData, { resultMsg: t("mobile.label.duplicateBarcode") /*중복 바코드*/ });
        } else if (barcodeCheckRef.result == 0 && validate.deleteFlag) {
            playAudio(errorAudio);
            return Object.assign(inputData, { resultMsg: t("com.message.noDateTo", [t("com.label.del")]) }); // 삭제할 데이터가 없습니다.
        }
        const result = await mobileOrderBarcode(params)
            .then((res) => {
                return { ...res?.result, outAmt: round(res?.result.outAmt, 1) };
            })
            .catch(console.error);

        /** 메세지 출력, 바코드 input박스 초기화 */
        Object.assign(inputData, { resultMsg: result.resultMsg });
        if (result?.errorCode !== 1000) {
            playAudio(errorAudio);
            return false;
        } else if (!result?.rowId) {
            playAudio(errorAudio);
            return Object.assign(inputData, { resultMsg: t("com.message.reTry") }); // 다시 시도해주세요.
        }

        playAudio(successAudio);

        // if (myGrid.value.getGridData().some((val) => val.itemCd+val.purchCustCd == result.itemCd+result.purchCustCd )) {
        if (myGrid.value.getGridData().some((val) => val.rowId == result.rowId)) {
            const { outQty } = myGrid.value.getItemByRowId(result.rowId);
            /** 매입사코드 세팅 */
            Object.assign(result, { purchCustCd: myGrid.value.getItemByRowId(result.rowId).purchCustCd });
            if (validate.deleteFlag) {
                scanDelete(result)
                    .then((res) => {
                        //업데이트가 된 경우가 있으면
                        if (res.result === 1) {
                            myGrid.value.updateRowsById({ rowId: result.rowId, itemCd: result.itemCd, purchCustCd: result.purchCustCd, outQty: Number(outQty) - Number(result.outQty) });
                            return;
                        } else {
                            Object.assign(inputData, { resultMsg: t("mobile.message.noBarcodeToDeleteOnSameVoucher") }); // 동일 전표에 삭제할 바코드가 없습니다.
                            return;
                        }
                        // Object.assign(inputData, { barcodeInput: null });
                    })
                    .catch((e) => {
                        console.error(e);
                    })
                    .then((res) => {
                        moveXY(result);
                    });
            } else {
                /** 기존꺼에 추가 */
                // myGrid.value.updateRowsById([{ itemCd: result.itemCd, outQty: Number(outQty) + Number(result.outQty) }]);
                scanSuccess(result)
                    .then((res) => {
                        myGrid.value.updateRowsById({ rowId: result.rowId, itemCd: result.itemCd, purchCustCd: result.purchCustCd, outQty: Number(outQty) + Number(result.outQty) });
                        // Object.assign(inputData, { barcodeInput: null });
                    })
                    .catch((e) => {
                        console.error(e);
                        popupHandler({ type: "mobileAlert", componentType: "mobileMsg", msg: e.message });
                    })
                    .then((res) => {
                        moveXY(result);
                    });
            }
        } else {
            if (validate.deleteFlag) {
                Object.assign(inputData, { resultMsg: t("com.message.noDateTo", [t("com.label.del")]) }); // 삭제할 데이터가 없습니다.
            } else {
                /** 매핑되는 품목코드가 없을 시 새로운 주문을 생성해야함 */
                const confirmRes = await popupHandler({
                    type: "mobileConfirm",
                    msg: t("mobile.message.confirmCreateOrderForNewItemAndCustomer"), // 기존에 존재하지 않는 (품목+거래처)입니다. <br>주문생성을 하시겠습니까?
                });
                if (!confirmRes.ok) return;
                const scanRes = await scanFail(result);
                myGrid.value.addRow(result);
                // Object.assign(inputData, { barcodeInput: null });
                scanStart();
                moveXY(result);
            }
        }
    } catch (error) {
        popupHandler({ type: "mobileAlert", componentType: "mobileMsg", msg: error.message });
    } finally {
        loading.value = false;
        nextTick(scanStart);
        e.target.select();
    }
};

/** 스캔시마다 이동 */
const moveXY = (result) => {
    myGrid.value.setRowPosition(myGrid.value.rowIdToIndex(result.rowId));
    myGrid.value.setSelectionByIndex(myGrid.value.rowIdToIndex(result.rowId), 3);
};

/** 출고확정 */
const orderConfirmBtnHandler = (e) => {
    console.log("현재 worker 값:", cacheVariable.worker);
    if (cacheVariable.worker === null) return popupHandler({ type: "mobileAlert", componentType: "mobileMsg", msg: t("com.message.proceedAfterSelect", [t("order.label.assignedDriver")]) }); // 담당기사 선택 후 작업을 진행해주세요.

    Object.assign(cacheVariable.params, { workerMan: cacheVariable.worker });
    popupHandler({
        type: "mobileConfirm",
        msg: t("com.message.confirmApprove"), // 확정하시겠습니까?
        ok: () => {
            orderConfirm(cacheVariable.params)
                .then(() => {
                    popupHandler({ type: "mobileAlert", componentType: "mobileMsg", msg: t("com.message.approved") }); // 확정되었습니다.
                    successPage();
                })
                .catch((e) => {
                    popupHandler({ type: "mobileAlert", componentType: "mobileMsg", msg: e.message });
                });
        },
    });
};

const cellEditEnd = (e) => {
    if (cacheVariable.scanFlag) grid.restoreEditedCells(e.rowIndex);
    if (e.item.cowPigGbnFg != 7 && e.dataField === "outQty") {
        grid.restoreEditedCells(e.rowIndex);
    } else if (e.item.cowPigGbnFg === 7 && e.dataField === "outQty") {
        api.post("/api/v1/biz/mobile/orderUpdate2", e.item).catch((e) => popupHandler({ type: "alert", msg: e.message }));
    }
};

const cellEditBegin = (e) => {
    if (cacheVariable.scanFlag) return popupHandler({ type: "mobileAlert", msg: t("order.message.confirmOnlyIfOrderConfirmed", [t("com.label.update")]) }); // 주문확정 상태에서만 수정 가능합니다.
    if (e.item.cowPigGbnFg != 7 && e.dataField === "outQty") {
        return popupHandler({ type: "mobileAlert", msg: t("order.message.canUpdateOnlyProduct") }); // 상품만 수정 가능합니다.
    }
};

// ||==================================================||
// ||Hook 영역                                          ||
// ||==================================================||
onActivated(() => {
    cacheVariable.worker = null;
    mobileOrderWorker({})
        .then((res) => {
            Object.assign(
                cacheVariable.workerList,
                res?.result.map((v) => ({ ...v, dtlCommCd: v.userId, dtlCommNm: v.userNm })),
            );
        })
        .catch(console.error);
    Object.assign(cacheVariable, {
        params: props.props,
        scanFlag: props.props?.procStatFg == "S" ? false : true /*주문확정*/,
    });
    search();
});
</script>

<template>
    <div id="container" class="poAbsolMView">
        <audio hidden="true" ref="successAudio">
            <source src="../../static/sound/success.mp3" type="audio/mpeg" />
        </audio>
        <audio hidden="true" ref="errorAudio">
            <source src="../../static/sound/error.mp3" type="audio/mpeg" />
        </audio>
        <table class="tableLayout mt0">
            <colgroup>
                <col style="width: 20%" />
                <col style="width: 30%" />
                <col style="width: 20%" />
                <col style="width: 30%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>{{ t("aggregration.label.outboundDate") /*출고일자*/ }}</th>
                    <td>{{ inplanDate }}</td>
                    <!-- <td>{{{ cacheVariable.params?.viewDate }}}</td> -->
                    <th>{{ t("analysis.label.slipNumber") /*전표번호*/ }}</th>
                    <td class="slipNo" @click="openMsg">{{ cacheVariable.params?.slipNo.substr(4, 17) }}</td>
                </tr>
                <tr>
                    <th>{{ t("com.label.salesCust") /*매출처*/ }}</th>
                    <td>{{ cacheVariable.params?.sellerCustNm }}</td>
                    <th>{{ t("adjust.label.logisticsCenter") /*물류센터*/ }}</th>
                    <td>{{ cacheVariable.params?.outWhCustNm }}</td>
                </tr>
            </tbody>
        </table>
        <!--- S : 개체식별 -->
        <div class="M_SearchBox mt10">
            <div class="form_wrap">
                <div class="select_wrap mr10">
                    <label v-if="cacheVariable.scanFlag">{{ t("mobile.label.approvalUser") /*확정자*/ }}</label>
                    <label v-if="cacheVariable.scanFlag">{{ cacheVariable.params?.lastId }}</label>
                    <label>{{ t("order.label.assignedDriver") /*담당기사*/ }}</label>
                    <label v-if="cacheVariable.scanFlag">{{ cacheVariable.params?.workerMan }}</label>
                    <ComboSelectInput v-model="cacheVariable.worker" @update:modelValue="val => cacheVariable.worker = val || null" :params="{ selectType: 'S', divClass: 'select-custom', selectClass: 'select w90 mwA' }" :options="cacheVariable.workerList" :disabled="cacheVariable.scanFlag"/>
                </div>
                <div class="form_wrap">
                    <CheckBoxSelect v-model="validate.deleteFlag" :params="{ label: t('com.label.del') /*삭제*/, labelFor: 'check01', spanClass: 'form_cell form_check login' }" @change="scanStart" :disabled="cacheVariable.scanFlag"/>
                </div>
            </div>
        </div>
        <!--- E : 개체식별 -->

        <!--- S : 버튼 -->
        <div class="btn_area_m">
            <PopupMenuButton :params="{ name: t('mobile.label.scanStart') /*스캔시작*/, buttonClass: 'default mob_default' }" @click="scanStart" :disabled="cacheVariable.scanFlag" />
            <PopupMenuButton :params="{ name: t('logistics.label.outboundApprove') /*출고확정*/, buttonClass: 'default mob_default ml5' }" @click="orderConfirmBtnHandler" :disabled="cacheVariable.scanFlag" />
            <PopupMenuButton :params="{ name: validate.keyboardText /*출고확정*/, buttonClass: 'default mob_default ml5' }" @click="keyboardControl" :disabled="cacheVariable.scanFlag" />
        </div>
        <!--- E : 버튼 -->
        <table class="tableLayout mt10">
            <colgroup>
                <col style="width: 20%" />
                <col style="width: 80%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>{{ t("com.label.barcode") /*바코드*/ }}</th>
                    <td>
                        <TextBox
                            type="text"
                            style="border: 1px solid #ccc; outline: none;"
                            :params="{ label: '', inputClass: 'barcode-input' }"
                            @keydown.enter="
                                (e) => {
                                    loading ? undefined : barcodeScan(e);
                                }
                            "
                            :disabled="loading || cacheVariable.scanFlag"
                            autocomplete="off"
                            id="barcodeInput"
                            :inputmode="validate.keyboardFlag ? '' : 'none'"
                            enterkeyhint="enter"
                            v-model.trim="inputData.barcodeInput"
                            :style="{ backgroundColor: computedStyle?.backgroundColor, width: '100%' }"
                            @update:modelValue="
                                ($event) => {
                                    inputData.resultMsg = '';
                                }
                            "
                        />
                    </td>
                </tr>
                <!-- <tr>
                    <th>식별번호</th>
                    <td>
                        <div class="form_wrap">
                            <span class="form_cell form_input">
                                <input type="text">
                            </span>
                        </div>
                    </td>
                </tr> -->
                <tr>
                    <th>메세지</th>
                    <td>
                        <span class="error_text" style="display: block; max-width: 100%; white-space: pre-line;">{{ inputData.resultMsg }}</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <!--  S : AUI Grid -->
        <div id="auiGrid" class="mobile mt5">
            <AUIGrid ref="myGrid" :columnLayout="columnLayout" :gridProps="gridProps" :footerLayout="footerLayout" @cellEditEnd="cellEditEnd" @cellEditBegin="cellEditBegin" />
        </div>
        <!--  E : AUI Grid -->
    </div>
</template>

<style scoped>
.slipNo {
    font: 400 10px/15px "Pretendard" !important;
}
</style>
