<script setup>
// ||==================================================||
// ||import 영역                                        ||
// ||==================================================||
import { onDeactivated, onActivated, onMounted, reactive, ref, inject, watch, computed } from "vue";
import AUIGrid from "@/static/AUIGrid-Vue.js/AUIGrid.vue";
import { AUIGridDefault } from "@/common/utils/AUIGridDefault";

import { biz } from "@/common/utils/biz"; // 공통 utils
import { useI18n } from "vue-i18n"; // 다국어

import { ko } from "date-fns/locale";

import moment from "moment";

import CheckBoxSelect from "@/components/template/checkbox/CheckBoxSelect.vue"; // 체크박스
import RadioSelect from '@/components/template/radio/RadioSelect.vue'; //라디오셀렉트

import {changeProcStatFgDirectionFix/*지시확정*/, selectOrderItem /*조회*/, checkWmOrderOutDtlBarcode/*바코드스캔*/, insertBarcodeItemApi /*바코드품목생성*/, deleteBarcodeItemApi/*바코드삭제*/ } from "@/api/mobile";
// ==================================================
// 변수 선언 영역
// ==================================================

// 메세지 변수
const { t } = useI18n();

const model = ref("U"); 

const emit = defineEmits(["goBack"]);

// 오디오 소스 성공/에러
const successAudio = ref();
const errorAudio = ref();

//공통코드
const EAT601 = JSON.parse(localStorage.getItem("EAT601")); // 공정유형
const radioOptions = [
    { dtlCommCd: "U", dtlCommNm: t("mobile.label.identifiedUnit") },              // 개체
    { dtlCommCd: "UP", dtlCommNm: t("mobile.label.identifiedUnitAndProduct") }, // 개체 + 제품
];

const myGrid = ref(null);
const props = defineProps(["props"]);

const locale = reactive(ko);
// 등록상태 아니면 input, button 비활성화
const isDisabled = computed(() => props.props?.procStatFg != 1);
/** 팝업 핸들러 */
const popupHandler = inject("popupHandler");

/** Interface */
const inputDataState = {
    barcodeInput: null,
    distrHistoryInput: null,
    resultMsg: null,
};
const validateState = {
    barcodeFlag: false,
    deleteFlag: false,
    keyboardFlag: false,
    keyboardText: t("mobile.label.keyboardOn")/*키보드 켜기*/,
};
const inputData = reactive({ ...inputDataState });
const validate = reactive({ ...validateState });

/** 바코드 데이터, props 관리 */
const cacheVariable = reactive({
    params: props.props,
});

// ==================================================
// 그리드 영역
// ==================================================
/** 그리드 속성 정의 */
const gridProps = AUIGridDefault.gridPropsBuilder().withExtraProps({ height: 350, rowIdField: "itemCd", rowIdTrustMode: true }).build();

const columnLayout = [
    { dataField: "itemCd", headerText: t("item.label.itemCode")/*품목코드*/, width: 70 },
    { dataField: "itemNm", headerText: t("item.label.itemName")/*품목명*/ },
    { dataField: "outWtQty", headerText: t("com.label.weight")/*중량*/, width: 53, dataType: "numeric", style: "gridTextAlignRight", formatString: "#,##0.00" },
    { dataField: "outQty", headerText: t("com.label.qty")/*수량*/, width: 53, style: "textRight" },
];
// ==================================================
// 사용자 정의 함수 영역
// ==================================================
/** 조회 */
const retrieve = () => {
    const params = {
        ...cacheVariable.params,
    };

    myGrid.value.showAjaxLoader();
    selectOrderItem(params)
        .then((res) => res?.result)
        .then(myGrid.value.setGridData)
        .then(myGrid.value.removeAjaxLoader)
        .catch(console.error);
};

/** 바코드, 이력번호 스캔 공통 함수 */
const scan = async (e) => {
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(e.target.value)) {
        return Object.assign(inputData, { resultMsg: t("mobile.message.pleaseSwitchToEnglishKeyboard")/*영문키보드로 바꿔서 진행해주세요.*/ });
    }
    const inputId = e.srcElement.id;
    const isBarcode = inputId === "barcodeInput";

    if (e.target.value.trim() === "") {
        inputData.resultMsg = `${isBarcode ? t("com.label.barcode"): t("com.label.traceNumber")}${t("com.message.inputItemL")}`;//바코드/이력번호를 입력해주세요.
        return;
    }
    if (isBarcode && validate.barcodeFlag) {
        document.getElementById("distrHistoryInput").select();
        return;
    }
    const res = await checkWmOrderOutDtlBarcode({ barcodeNo: inputData.barcodeInput });
    const duplicateBarcodeNoList = res.result;

    console.log(inputData.barcodeInput);
    if (duplicateBarcodeNoList.length > 0 && !validate.deleteFlag) {
        // return popupHandler({type:'fnAlert', msg: '이미 투입된 바코드입니다.', ok: ()=>{}});
        const alertRes = await popupHandler({ type: "fnAlert", msg: `${alreadyOutBarcode, [duplicateBarcodeNoList.map((v) => v.slipNo).join(", ")]}` });
        if (alertRes.ok) {
            return e.target.select();
        }
    }
    const params = {
        slipNo: cacheVariable.params.slipNo,
        inWhCustCd: cacheVariable.params.inWhCustCd,
        outWhCustCd: cacheVariable.params.outWhCustCd,
        sellerCustCd: cacheVariable.params.sellerCustCd,
        groupSlipNo: cacheVariable.params.groupSlipNo,
        barcodeNo: inputData.barcodeInput,
        distrHistoryNo: inputData.distrHistoryInput,
    };
    //inputData.barcodeInput = null;
    // inputData.distrHistoryInput = null;
    inputData.resultMsg = "";

    if (validate.deleteFlag) {
        deleteBarcodeItem(params, e);
    } else {
        insertBarcodeItem(params, e);
    }
};

// 바코드 품목 생성
const insertBarcodeItem = async (params, e) => {
    try {
        const res = await insertBarcodeItemApi(params);

        const errorCode = res?.result.errorCode;

        if (res.code == 200) {
            if (errorCode == null) {
                playAudio(errorAudio);
                inputData.resultMsg = t("com.message.barcodeDoesNotExist");//존재하지 않는 바코드입니다.
            } else if (errorCode == 4001) {
                playAudio(errorAudio);
                inputData.resultMsg = t("customer.message.partnerRegionBarcodeRuleNotFound");//협력사 지역별 바코드규칙정보가 존재하지 않습니다.
            } else if (errorCode == 4002) {
                playAudio(errorAudio);
                inputData.resultMsg = t("customer.message.externalItemCodeConnectionFailed");//외부품목코드 연결이 안됩니다.
            } else if (errorCode == 8000) {
                playAudio(errorAudio);
                inputData.resultMsg = t("mobile.message.itemNotHandledBySalesGroup");//취급품목으로 존재하지 않습니다.
            } else if (errorCode == 1000) {
                // inputData.barcodeInput = null;
                inputData.distrHistoryInput = null;
                playAudio(successAudio);
                retrieve();
            }
            e.target.select();
            return;
        }
    } catch (error) {
        playAudio(errorAudio);
        //return inputData.resultMsg = "저장에 실패하였습니다."
        console.log(error);
        return (inputData.resultMsg = error.message);
    }
};

const deleteBarcodeItem = async (params, e) => {
    try {
        const res = await deleteBarcodeItemApi(params);
        const errorCode = res?.result.errorCode;

        if (res.code == 200) {
            if (errorCode == null) {
                playAudio(errorAudio);
                inputData.resultMsg = t("com.message.barcodeDoesNotExist");//존재하지 않는 바코드입니다.
            } else if (errorCode == 4001) {
                playAudio(errorAudio);
                inputData.resultMsg = t("customer.message.partnerRegionBarcodeRuleNotFound");//협력사 지역별 바코드규칙정보가 존재하지 않습니다.
            } else if (errorCode == 4002) {
                playAudio(errorAudio);
                inputData.resultMsg = t("customer.message.externalItemCodeConnectionFailed");//외부품목코드 연결이 안됩니다.
            } else if (errorCode == 8000) {
                playAudio(errorAudio);
                inputData.resultMsg = t("mobile.message.itemNotHandledBySalesGroup");//취급품목으로 존재하지 않습니다.
            } else if (errorCode == 1000) {
                // inputData.barcodeInput = null;
                inputData.distrHistoryInput = null;
                playAudio(successAudio);
                retrieve();
            }
            e.target.select();
            return;
        }
    } catch (error) {
        playAudio(errorAudio);
        inputData.resultMsg = error.message;
    }
};

/** 개체식별 라디오버튼 핸들러 */
const radioControl = (e) => {
    if (e.target.id === "U") {
        validate.barcodeFlag = false;
    } else if (e.target.id === "UP") {
        validate.barcodeFlag = true;
    }
    /** input 초기화 */
    Object.assign(inputData, inputDataState);
};

/** 스캔시작 버튼 */
const scanStart = (e) => {
    document.getElementById("barcodeInput").select();
};

/** 키보드 온/오프 */
const keyboardControl = (e) => {
    if (validate.keyboardFlag) {
        validate.keyboardText = t("mobile.label.keyboardOn")/*키보드 켜기*/;
    } else {
        validate.keyboardText = t("mobile.label.keyboardOff")/*키보드 끄기*/;
    }

    validate.keyboardFlag = !validate.keyboardFlag;
};

// 지시확정 버튼
const saveData = async (e) => {
    const params = {
        ...cacheVariable.params,
    };
    const confirmRes = await popupHandler({ type: "confirm", msg: t("com.message.confirmApprove") });//확정하시겠습니까?
    if (!confirmRes.ok) return;

    const res = await changeProcStatFgDirectionFix(params)
        //.then(res => console.log(res?.result))
        .then()
        .catch(console.error);
    if (res.code == 200 || res?.result == 1) {
        popupHandler({ type: "mobileAlert", msg: t("com.message.approved") });//확정되었습니다.
        emit("goBack", {});
    }
};

// 오디오 재생 - 정상/실패
const playAudio = (audio) => {
    if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
        audio.value.play();
    }
};

onActivated(() => {
    retrieve();
});
onDeactivated(() => {
    /** 창 나가면 input 초기화 */
    Object.assign(inputData, inputDataState);
});

// props 갱신문제 수정
watch(
    () => props.props,
    (newVal) => {
        cacheVariable.params = newVal;
        retrieve();
    },
);
</script>

<template>
    <div id="container" class="poAbsolMView">
        <audio hidden="true" ref="successAudio">
            <source src="../../static/sound/success.mp3" type="audio/mpeg" />
        </audio>
        <audio hidden="true" ref="errorAudio">
            <source src="../../static/sound/error.mp3" type="audio/mpeg" />
        </audio>
        <table class="tableLayout">
            <colgroup>
                <col style="width: 20%" />
                <col style="width: 30%" />
                <col style="width: 20%" />
                <col style="width: 30%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>{{t("request.label.instructionDate")/*지시일자*/}}</th>
                    <td>{{ moment(cacheVariable.params.searchDate).format("YYYY-MM-DD") }}</td>
                    <th>{{t("analysis.label.slipNumber")/*전표번호*/}}</th>
                    <td class="slipNo">{{ cacheVariable.params.slipNo.substr(4, 17) }}</td>
                </tr>
                <tr>
                    <th>{{t("request.label.productionCenter")/*생산센터*/}}</th>
                    <td>{{ cacheVariable.params.inWhCustNm }}</td>
                    <th>{{t("com.label.salesCust")/*매출처*/}}</th>
                    <td>{{ cacheVariable.params.sellerCustNm }}</td>
                </tr>
                <tr>
                    <th>{{t("request.label.instructionType")/*지시유형*/}}</th>
                    <td colspan="3">{{ EAT601.find((i) => i.dtlCommCd === cacheVariable.params.processTypeCd)?.dtlCommNm || "" }}</td>
                </tr>
                <tr>
                    <th style="color: red">{{'*'+t("request.label.productionNoti")/*생산 전달사항*/}}</th>
                    <td colspan="3">{{ cacheVariable.params.wmRemark }}</td>
                </tr>
            </tbody>
        </table>

        <!--- S : 개체식별 -->
        <div class="M_SearchBox mt10">
            <ul class="SearchInner">
                <li class="radioWrap">
                    <span class="label">
                        {{ t("mobile.label.unitDistinct") /*개체식별*/ }}
                    </span>

                    <!-- 공통 Radio 컴포넌트 -->
                    <RadioSelect
                        v-model="model"
                        :params="{
                            label: '',
                            layout: 'mobile',
                            name: 'unitType',
                            divClass: 'form_wrap form_cell form_radio'
                        }"
                        :options="radioOptions"
                        @change="radioControl"
                        :disabled="isDisabled"
                    />

                    <!-- 기존 체크박스 부분 -->
                    <div class="form_wrap" style="margin-left: 20px;">
                        <CheckBoxSelect
                            v-model="validate.deleteFlag"
                            :params="{
                                label: t('com.label.del'),
                                labelFor: 'deleteFlag',
                                spanClass: 'form_cell form_check'
                            }"
                            @change="scanStart"
                            :disabled="isDisabled"
                        />
                    </div>
                </li>
            </ul>
        </div>

        <!--- E : 개체식별 -->

        <!--- S : 버튼 -->
        <div class="btn_area_m mb10">
            <button type="button" class="default mob_default" @click="scanStart" :disabled="isDisabled">
                <span>{{ t("mobile.label.scanStart") /*스캔시작*/}}</span>
            </button>
            <button type="button" class="default mob_default ml5" @click="keyboardControl" :disabled="isDisabled">
                <span>{{ validate.keyboardText }}</span>
            </button>
            <button type="button" class="default mob_default ml5" @click="saveData" :disabled="isDisabled">
                <span>{{ t("request.label.instructionApproval") /*지시확정*/}}</span>
            </button>
        </div>
        <!--- E : 버튼 -->

        <table class="tableLayout mt0">
            <colgroup>
                <col style="width: 20%" />
                <col style="width: 80%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>{{ t("com.label.barcode") /*바코드*/}}</th>
                    <td>
                        <input
                            type="text"
                            class="mobile_input w100p"
                            @keydown.enter="scan"
                            autocomplete="off"
                            id="barcodeInput"
                            :inputmode="validate.keyboardFlag ? '' : 'none'"
                            v-model.trim="inputData.barcodeInput"
                            :disabled="isDisabled"
                            @click="
                                ($event) => {
                                    $event.target.select();
                                }
                            "
                        />
                    </td>
                </tr>
                <tr>
                    <th>{{ `${t("mobile.label.identifiedUnit")}${t("com.label.number")}` /*개체번호*/}}</th>
                    <td>
                        <input type="text" class="mobile_input w100p" @keydown.enter="scan" autocomplete="off" id="distrHistoryInput" :inputmode="validate.keyboardFlag ? '' : 'none'" v-model="inputData.distrHistoryInput" :disabled="!validate.barcodeFlag || isDisabled" />
                    </td>
                </tr>
                <tr>
                    <th>{{ t("com.label.errorMsg") /*에러메시지*/}}</th>
                    <td>
                        <span class="error_text">{{ inputData.resultMsg }}</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <!--  S : AUI Grid -->
        <div id="auiGrid" class="mobile mt5">
            <AUIGrid ref="myGrid" :columnLayout="columnLayout" :gridProps="gridProps" />
        </div>
    </div>
</template>

<style scoped>
.form_wrap {
    display: flex;
    align-items: center;
}

.form_cell.form_check {
    display: flex;
    align-items: center;
    height: 32px;
    gap: 4px;
}

input[type="checkbox"] {
    margin: 0;
    vertical-align: middle;
}

.checkbox {
    font-size: 14px;
    margin-left: 100px;
}

.slipNo {
    font: 400 12px/15px "Pretendard" !important;
}
.mobile_input {
    border: 1px solid #c7c7c7;
    height: 30px;
    padding: 4px 8px;
    font: 500 14px/18px "Pretendard";
    color: #454545;
    width: 80%;
}
</style>
