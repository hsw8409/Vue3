<!--
 * @file     \components\mobile\UI_MOB_004P01.vue
 * @menu     실사상세화면
 * @author   
 * @since    2025-10-29
 * @version  1.0
 * 
 * @description 
 * 실사상세화면
-->

<script setup>
// ||==================================================||
// ||import 영역                                        ||
// ||==================================================||
import AUIGrid from "@/static/AUIGrid-Vue.js/AUIGrid.vue";
import { onActivated, ref, isProxy, toRaw, computed, nextTick, inject } from "vue";
import { AUIGridDefault } from "@/common/utils/AUIGridDefault";
import { useI18n } from "vue-i18n";
import RadioSelect from '@/components/template/radio/RadioSelect.vue';
import TextBox from "@/components/template/text/TextBox.vue"; // 텍스트박스
import PopupMenuButton from "@/components/template/button/PopupMenuButton.vue"; // 팝업메뉴버튼
import { selectCenterList /*물류센터*/, selectLclsList /*대분류조회*/, mobileAdjustDetail /*상세조회*/, adjustMobileBarcode /*바코드조회*/, adjustMobileBarcodeCheck /*바코드체크*/, adjustScanRemove /*바코드삭제*/, updateRealQtyItem /*저장*/ } from "@/api/mobile";


// ||=====================================================||
// ||변수 선언 영역                                         ||
// ||=====================================================||
// 이전 화면에서 넘겨준 param을 받아서 사용
const props = defineProps(["props"]);
const initProps = ref({ // props를 까서 실제로 사용할 변수
    realDate: "",
    lclsItemCd: "",
    whCustCd: "",
    realTypeGbnFg: "",
    confYn: "",
});

const { t } = useI18n();
const popupHandler = inject("popupHandler");

// 라디오버튼 option
const COM420 = JSON.parse(localStorage.getItem("COM420")) || [];

// 컴포넌트
const barcodeInput = ref(null); // 바코드 Input 컴포넌트
const distHistNoInput = ref(null); // 이력번호 Input 컴포넌트
const myGrid1 = ref(null); // 그리드

// 컴포넌트 관련
const checkedRadio = ref("U"); // 라디오버튼 현재 선택값
const useDistHistNo = computed(() => { // [이력번호] Input 열어줄지 여부
    return checkedRadio.value == "UP" && !!(inputData.value.barcode);
});
const isScanOn = ref(false); // [스캔시작] 버튼을 눌러서 [스캔종료] 버튼이 표시되고 있는 상태인지 여부
const scanText = computed(() => { // [스캔시작] 또는 [스캔종료] 버튼에 현재 표시되는 이름
    return isScanOn.value ? t("mobile.label.scanEnd") /*스캔종료*/ : t("mobile.label.scanStart") /*스캔시작*/;
});
const isKeyboardOn = ref(false);
const keyboardText = computed(() => { // [키보드 켜기] 또는 [키보드 끄기] 버튼에 현재 표시되는 이름
    return isKeyboardOn.value ? t("mobile.label.keyboardOff") /*키보드 끄기*/ : t("mobile.label.keyboardOn") /*키보드 켜기*/;
});

// 컴포넌트 활성화/비활성화 관련
const isTranxOn = ref(false); // 트랜잭션 진행중 여부
const computedStyle = computed(() => {
    return { backgroundColor: isTranxOn.value ? "#eee" : "" };
});
const isNotAvailable = computed(() => {
    return initProps.value.confYn == "Y";
});
const disableBarcodeInput = computed(() => {
    return initProps.value.confYn == "Y" || isTranxOn.value || !isScanOn.value;
});
const disableDistHistNoInput = computed(() => {
    return initProps.value.confYn == "Y" || isTranxOn.value || !isScanOn.value || !useDistHistNo.value;
});
const disableWhenScanIsOn = computed(() => {
    return initProps.value.confYn == "Y" || isTranxOn.value || isScanOn.value;
});

// 화면 상단 [실사일자], [실사유형], [물류센터]에 표시될 내용 (고정)
const infoLabels = ref({
    inspectDate: "",
    inspectTarget: "",
    whCustNm: "",
});

// [바코드], [이력번호], [처리메시지] 컴포넌트 입력값
const inputDataState = {
    barcode: "",
    distribution: "",
    errorMessage: "",
};
const inputData = ref({ ...inputDataState });

// 오디오
const successAudio = ref();
const errorAudio = ref();

// 셀 복사용
const copied = ref(false);


// ||==================================================||
// ||그리드 영역                                         ||
// ||==================================================||
const gridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: "100%",
        selectionMode: "singleRow",
        rowHeight: 50,
        autoScrollSize: true,
        rowIdField: "barcodeNo",
        editable: true,
        showFooter: true,
        editBeginMode: "click",
        onlyEnterKeyEditEnd: true, // 이 속성을 true 설정하면 셀을 수정하고 완료를 하기 위해 엔터(Enter) 키를 입력할 때 수정 완료 행위만 하고 다음 행으로 선택자를 내리지 않습니다.
    })
    .build();

const columnLayout1 = [
    {
        dataField: "itemInfo",
        headerText: `${t("analysis.label.purchaseCustName")} / ${t("item.label.itemName")}<br/>${t("com.label.barcode")} / ${t("com.label.traceNumber")} / `, //"매입처명 / 품목명<br/>바코드<br/>이력번호"
        width: "64%",
        renderer: {
            type: "TemplateRenderer",
        },
        editable: false,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
            //HTML 템플릿 작성
            let splitValue = value.split("^");
            return `<div>${splitValue[0]} / ${splitValue[1]}</div>${splitValue[2]}<br/>${splitValue[3]}`;
        },
    },
    { dataField: "currStockQty", headerText: `${t("com.label.stock")}<br/>${t("com.label.qty")}` /*재고수량*/, width: "12%", style: "gridTextAlignRight", editable: false },
    {
        dataField: "realQty",
        headerText: `${t("com.label.audit")}<br/>${t("com.label.qty")}` /*실사수량*/,
        width: "12%",
        style: "gridTextAlignRight",
        editable: true,
        dataType: "numeric",
        formatString: "#,##0",
        editRenderer: {
            type: "InputEditRenderer",
            onlyNumeric: true, // 0~9만 입력가능
            allowPoint: false, // 소수점( . ) 도 허용할지 여부
            allowNegative: false, // 마이너스 부호(-) 허용 여부
            maxlength: 5,
        },
    },
    { dataField: "diffQty", headerText: `${t("com.label.diff")}<br/>${t("com.label.qty")}` /*차이수량*/, width: "12%", style: "gridTextAlignRight", editable: false },
];
const footerLayout = [
    { labelText: t("com.label.sum") /*합계*/, positionField: "#base" },
    { dataField: "realQty", positionField: "realQty", operation: "SUM", formatString: "#,##0", style: "gridTextAlignRight" },
];


// ||==================================================||
// ||사용자 정의 함수 영역                                ||
// ||==================================================||
// 물류센터 조회 (물류센터명 표시용)
const centerList = async () => {
    const res = await selectCenterList({});
    infoLabels.value.whCustNm = res?.result?.find((row) => row.custCd == initProps.value.whCustCd)?.custNm;
};

// 대분류 조회 (실사유형 표시용)
const lclsList = async () => {
    if (initProps.value.realTypeGbnFg == "M") {
        infoLabels.value.inspectTarget = t("adjust.label.itemAdjust") /*단품실사*/;
    } else if (initProps.value.lclsItemCd == "*") {
        infoLabels.value.inspectTarget = t("com.label.all") /*전체*/;
    } else {
        const res = await selectLclsList({});
        infoLabels.value.inspectTarget = res?.result?.find((row) => row.lclsItemCd == initProps.value.lclsItemCd)?.lclsItemNm;
    }
};

// 각종 제어변수 초기화
const resetVariables = () => {
    checkedRadio.value = "U";
    isScanOn.value = false;
    isKeyboardOn.value = false;
    isTranxOn.value = false;
    inputData.value = { ...inputDataState };
};

// 실사내역 그리드 조회
const itemRetrieve = (barcode) => {
    const params = {
        realDate: initProps.value.realDate,
        whCustCd: initProps.value.whCustCd,
        lclsItemCd: initProps.value.lclsItemCd
    };

    myGrid1.value.showAjaxLoader();
    mobileAdjustDetail(params)
        .then((res) => {
            myGrid1.value.setGridData(res?.result);
        })
        .then(() => {
            if (!!barcode) {
                myGrid1.value.setRowPosition(myGrid1.value.rowIdToIndex(barcode));
                myGrid1.value.setSelectionByIndex(myGrid1.value.rowIdToIndex(barcode), 2);
            }
        })
        .catch((e) => {
            popupHandler({
                type: "mobileAlert",
                componentType: "mobileMsg",
                msg: t("com.message.errorOccurred", [t("com.label.search") /*조회*/]) /*{0} 중 오류가 발생했습니다.*/
            });
        })
        .finally(() => {
            myGrid1.value.removeAjaxLoader();
            barcodeInput.value.setFocus();
        });
};

/* 라디오 버튼 변경 핸들러 */
const handleRadioChange = () => {
    if (isScanOn.value) {
        if (checkedRadio.value == "U") {
            inputData.value.distribution = "";
        }

        barcodeInput.value.setFocus();
    }
};

/* 스캔버튼 핸들러 */
const handleScanButtonToggle = () => {
    if (initProps.value.confYn == "Y") {
        popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("adjust.message.alreadyApprovedAudit"), /*이미 확정된 실사입니다.*/
        });
        return;
    }

    // 스캔시작/스캔종료 토글
    isScanOn.value = !isScanOn.value;

    if (isScanOn.value) {
        barcodeInput.value.setFocus();
    } else {
        inputData.value = { ...inputDataState };
    }
};

const keyboardControl = () => {
    isKeyboardOn.value = !isKeyboardOn.value;
};

/** 바코드스캔 오디오*/
const playAudio = (audio) => {
    if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
        // audio.value.play();
        setTimeout(() => {
            audio.value.play().catch((error) => console.log(error));
        }, 10); // 10ms 딜레이 추가
    }
};

// [바코드] Textbox 엔터키 입력 이벤트 핸들러
const handleEnterOnBarcodeInput = async () => {
    if (initProps.value.confYn == "Y") {
        return popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("adjust.message.alreadyApprovedAudit"), /*이미 확정된 실사입니다.*/
        });
    }

    // console.log(inputData.value.barcode);
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(inputData.value.barcode)) {
        return popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("mobile.message.pleaseSwitchToEnglishKeyboard"), /*영문키보드로 바꿔서 진행해주세요.*/
        });
    }

    inputData.value.distribution = "";

    if (checkedRadio.value == "UP") { // [개체식별] 라디오버튼 선택값이 "개체+제품"인 경우
        distHistNoInput.value.setFocus();

    } else if (checkedRadio.value == "U") { // [개체식별] 라디오버튼 선택값이 "개체"인 경우
        isTranxOn.value = true;

        try {
            // 바코드 중복 체크
            const isDuplicateBarcode = await isDuplicate();
            if (isDuplicateBarcode) {
                playAudio(errorAudio);

                await nextTick();
                barcodeInput.value.setFocus(); // ref를 사용하여 focus 설정

                // 해당 바코드 로우로 이동
                const idx = myGrid1.value.rowIdToIndex(inputData.value.barcode);
                if (idx >= 0) {
                    myGrid1.value.setRowPosition(idx); // 해당 행이 그리드의 최상단에 오도록 종스크롤 이동
                    myGrid1.value.setSelectionByIndex(idx, 2); // 셀 선택
                }

                return;
            }

            // 중복 체크를 통과한 경우, 바코드의 실사수량을 등록해준다.
            const params = {
                whCustCd: initProps.value.whCustCd,
                lclsItemCd: initProps.value.lclsItemCd,
                realTypeGbnFg: initProps.value.realTypeGbnFg,
                barcodeNo: inputData.value.barcode,
                realDate: initProps.value.realDate,
            };
            const res = await adjustMobileBarcode(params);
            const errCode = res?.result.errorCode;

            if (errCode == 4001) {
                inputData.value.errorMessage = t("customer.message.partnerRegionBarcodeRuleNotFound"); // 협력사 지역별 바코드규칙정보가 존재하지 않습니다.
            } else if (errCode == 4002) {
                inputData.value.errorMessage = t("customer.message.externalItemCodeConnectionFailed"); // 외부품목코드 연결이 안됩니다.
            } else if (errCode == 4003) {
                inputData.value.errorMessage = t("customer.message.noMappingBarcodeRule"); //바코드 규칙이 설정되어있지 않습니다.
            } else if (errCode == 4004) {
                inputData.value.errorMessage = t("com.message.barcodeDoesNotExist"); // 존재하지 않는 바코드입니다.
            } else if (errCode == 1000) {
                inputData.value.errorMessage = t("com.label.normal"); /*정상*/
            } else {
                inputData.value.errorMessage = t("com.message.errorOccurred", [t("com.label.apply") /*반영*/]); /*{0} 중 오류가 발생했습니다.*/
            }

            if (errCode == 1000) {
                playAudio(successAudio);
                itemRetrieve(inputData.value.barcode);

            } else {
                playAudio(errorAudio);

            }

        } catch (e) {
            popupHandler({
                type: "mobileAlert",
                componentType: "mobileMsg",
                msg: t("com.message.errorOccurred", [t("customer.label.barcodeConfirm") /*바코드 확인*/]), /*{0} 중 오류가 발생했습니다.*/
            });

        } finally {
            isTranxOn.value = false;
            await nextTick();
            barcodeInput.value.setFocus(); // ref를 사용하여 focus 설정

        }

    }
};

/**바코드 중복 체크 */
const isDuplicate = async () => {
    const params = {
        whCustCd: initProps.value.whCustCd,
        lclsItemCd: initProps.value.lclsItemCd,
        realTypeGbnFg: initProps.value.realTypeGbnFg,
        realDate: initProps.value.realDate,
        barcodeNo: inputData.value.barcode,
    };

    try {
        const res = await adjustMobileBarcodeCheck(params);

        if (res?.result > 0) {
            inputData.value.errorMessage = t("analysis.message.barcodeDuplicate"); // 바코드가 중복됩니다.
            return true;

        } else {
            inputData.value.errorMessage = "";
            return false;

        }

    } catch (e) {
        inputData.value.errorMessage = t("com.label.fail"); /*실패*/
        return true;

    }
};

// 이력번호 TextBox 엔터키 입력 이벤트 핸들러
const barcodeScanWithDistrHistoryNo = async () => {
    if (initProps.value.confYn == "Y") {
        popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("adjust.message.alreadyApprovedAudit"), /*이미 확정된 실사입니다.*/
        });
        return;
    }

    isTranxOn.value = true;

    try {
        const params = {
            whCustCd: initProps.value.whCustCd,
            lclsItemCd: initProps.value.lclsItemCd,
            realTypeGbnFg: initProps.value.realTypeGbnFg,
            barcodeNo: inputData.value.barcode,
            distrHistoryNo: inputData.value.distribution,
            realDate: initProps.value.realDate,
        };

        const res = await adjustMobileBarcode(params);
        const errCode = res?.result.errorCode;

        if (errCode == 4001) {
            inputData.value.errorMessage = t("customer.message.partnerRegionBarcodeRuleNotFound"); // 협력사 지역별 바코드규칙정보가 존재하지 않습니다.
        } else if (errCode == 4002) {
            inputData.value.errorMessage = t("customer.message.externalItemCodeConnectionFailed"); // 외부품목코드 연결이 안됩니다.
        } else if (errCode == 4003) {
            inputData.value.errorMessage = t("customer.message.noMappingBarcodeRule"); // 바코드 규칙이 설정되어있지 않습니다.
        } else if (errCode == 4004) {
            inputData.value.errorMessage = t("com.message.barcodeDoesNotExist"); // 존재하지 않는 바코드입니다.
        } else if (errCode == 1000) {
            inputData.value.errorMessage = t("com.label.normal"); /*정상*/
        } else {
            inputData.value.errorMessage = t("com.message.errorOccurred", [t("com.label.apply") /*반영*/]); /*{0} 중 오류가 발생했습니다.*/
        }

        if (errCode == 1000) {
            playAudio(successAudio);
            itemRetrieve(inputData.value.barcode);

        } else {
            playAudio(errorAudio);

        }

    } catch (e) {
        popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("com.message.errorOccurred", [t("customer.label.barcodeConfirm") /*바코드 확인*/]), /*{0} 중 오류가 발생했습니다.*/
        });

    } finally {
        isTranxOn.value = false;
        await nextTick();
        distHistNoInput.value.setFocus();

    }
};

/**바코드 선택 삭제 */
const scanRemove = async () => {
    if (initProps.value.confYn == "Y") {
        popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("adjust.message.alreadyApprovedAudit"), /*이미 확정된 실사입니다.*/
        });
        return;
    }

    if (myGrid1.value.getSelectedRows().length == 0) {
        await popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("com.message.noDataSelected"), /*선택된 데이터가 없습니다.*/
        });

        barcodeInput.value.setFocus();
        return;
    }

    const selectedRow = myGrid1.value.getSelectedRows()[0];
    if (selectedRow.realQty <= 0) {
        return popupHandler({
            type: "mobileAlert",
            componentType: "mobileMsg",
            msg: t("com.message.noDateTo", [t("com.label.del") /*삭제*/]), /*{0}할 데이터가 없습니다.*/
        });
    }

    const params = {
        ...selectedRow,
        lclsItemCd: selectedRow.keyLclsCd,
    };

    const res = await adjustScanRemove(params);
    await popupHandler({
        type: "mobileAlert",
        componentType: "mobileMsg",
        msg: res?.result?.errMsg
    });

    if (res.result?.errCd == "00") {
        itemRetrieve(params.barcodeNo);
    }
};

/** 편집가능셀 : 상품인 경우, 실사수량필드 */
const cellEditBegin = (e) => {
    // 확정된 실사라면 alert도 띄우지 않는다.
    if (initProps.value.confYn == "Y") {
        return false;
    }

    if (e.dataField == "realQty") { // [실사수량] 수정하는 경우
        if (e.item.cowPigGbnFg != 7) {
            popupHandler({
                type: "mobileAlert",
                componentType: "mobileMsg",
                msg: t("logistics.message.itemOnlyEditable") // 재고관리기준 '품목'만 수정 가능합니다.
            });
            return false; // false를 반환하면 편집, 수정을 못하도록 막습니다.
        }

        return true;

    } else {
        return false;

    }
};

/** 편집종료 후 저장 */
const cellEditEnd = (e) => {
    if (e.dataField === "realQty") {
        if (e.item.cowPigGbnFg != "7") {
            myGrid1.value.restoreEditedRows(e.rowIndex);

        } else { // 재고관리기준이 "품목"인 경우에만 가능함
            updateRealQtyItem({ ...e.item, lclsItemCd: e.item.itemCd })
                .then((res) => {
                    if (res.result > 0) {
                        playAudio(successAudio);
                        itemRetrieve(inputData.value.barcode);
                    }
                })
                .catch((error) => {
                    popupHandler({
                        type: "mobileAlert",
                        componentType: "mobileMsg",
                        msg: t("com.message.errorOccurred", [t("com.label.apply") /*반영*/]), /*{0} 중 오류가 발생했습니다.*/
                    });
                    myGrid1.value.restoreEditedRows(e.rowIndex);
                });
        }

    }
};

const fnCellDoubleClick = async (e) => {
    try {
        await navigator.clipboard.writeText(e.item.barcodeNo + " " + e.item.itemCd + " " + e.item.purchCustCd);
        copied.value = true;

        setTimeout(() => {
            copied.value = false;
        }, 1500); // 1.5초 뒤 "복사 완료!" 메시지 사라짐

    } catch (err) {
        copied.value = false;

    }
};


// ||==================================================||
// ||Hook 영역                                          ||
// ||==================================================||
/* 화면 로딩 */
onActivated(() => {
    // 이전 화면에서 넘겨준 props 핸들링
    initProps.value = isProxy(props.props) ? toRaw(props.props) : console.log("error: 77row");

    // initProps를 기반으로, 화면에 보여줄 명칭들 세팅
    infoLabels.value.inspectDate = initProps.value.realDate.replaceAll(/(\d{4})(\d{2})(\d{2})/g, "$1-$2-$3");
    centerList(); // 물류센터
    lclsList(); // 대분류

    // 제어변수 초기화 (뒤로가기 했다가 다시 들어오면 기존 내용이 남아있는 경우가 있어서 초기화 필요함)
    resetVariables();

    // 실사내역 그리드 조회
    itemRetrieve();
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
                <col style="width: 40%" />
                <col style="width: 20%" />
                <col style="width: 20%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>{{ t("adjust.label.auditDate") /*실사일자*/ }}</th>
                    <td>{{ infoLabels.inspectDate }}</td>
                    <th>{{ t("adjust.label.auditType") /*실사유형*/ }}</th>
                    <td>{{ infoLabels.inspectTarget }}</td>
                </tr>
                <tr>
                    <th>{{ t("adjust.label.logisticsCenter") /*물류센터*/ }}</th>
                    <td class="nowrap" colspan="3">{{ infoLabels.whCustNm }}</td>
                </tr>
            </tbody>
        </table>

        <!-- S : 개체식별 -->
        <table class="tableLayout mt5">
            <colgroup>
                <col style="width: 20%" />
                <col style="width: 80%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>{{ t("mobile.label.unitDistinct") /*개체식별*/ }}</th>
                    <td>
                        <div class="flex">
                            <!-- [2025.12.10. JYJ] 현재 사용하지 않는 기능으로 항상 disable처리 (그리드key값이 barcodeNo로 되어있어 개체+제품(UP) 사용시 망가짐) -->
                            <!-- 수정 전:    :disabled="isNotAvailable" -->
                            <!-- 수정 후:    disabled                   -->
                            <RadioSelect v-model="checkedRadio" :params="{ layout: 'mobile' }" :options="COM420"
                                @change="handleRadioChange" disabled />
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <!-- E : 개체식별 -->

        <!-- S : 버튼 -->
        <div class="btn_area_m mt5">
            <PopupMenuButton :params="{ name: scanText, buttonClass: 'default mob_default' }"
                @click="handleScanButtonToggle" :disabled="isNotAvailable" />
            <PopupMenuButton :params="{ name: keyboardText, buttonClass: 'default mob_default ml5' }"
                @click="keyboardControl" :disabled="disableWhenScanIsOn" />
        </div>
        <!-- E : 버튼 -->

        <table class="tableLayout mt5">
            <colgroup>
                <col style="width: 21%" />
                <col style="width: 79%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>{{ t("com.label.barcode") /*바코드*/ }}</th>
                    <td class="pr10">
                        <div class="form_wrap">
                            <TextBox v-model.trim="inputData.barcode"
                                :params="{ label: '', inputClass: 'w100p', spanClass: 'form_cell form_input' }"
                                ref="barcodeInput" :disabled="disableBarcodeInput" autocomplete="off"
                                :inputmode="isKeyboardOn ? '' : 'none'" enterkeyhint="enter"
                                :style="{ backgroundColor: computedStyle?.backgroundColor, width: '70%', border: '1px solid #ccc', outline: 'none' }"
                                @enter="
                                    () => {
                                        if (!isTranxOn) handleEnterOnBarcodeInput();
                                    }
                                " @update:modelValue="
                                    () => {
                                        inputData.distribution = '';
                                        inputData.resultMsg = '';
                                    }
                                " />
                        </div>
                    </td>
                </tr>
                <tr>
                    <th>{{ t("com.label.traceNumber") /*이력번호*/ }}</th>
                    <td class="pr10">
                        <div class="form_wrap">
                            <TextBox ref="distHistNoInput" v-model="inputData.distribution"
                                :params="{ label: '', spanClass: 'form_cell form_input', textClass: 'w100p' }"
                                :disabled="disableDistHistNoInput" maxlength="10"
                                @keydown.enter="barcodeScanWithDistrHistoryNo" />
                        </div>
                    </td>
                </tr>
                <tr>
                    <th>{{ t("com.label.processMsg") /*처리메시지*/ }}</th>
                    <td class="pr10">
                        <div class="form_wrap">
                            <span class="form_cell form_input">
                                {{ inputData.errorMessage }}
                            </span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <!--- S : 버튼 -->
        <div class="btn_area_m mt5">
            <PopupMenuButton
                :params="{ name: `${t('com.label.select')}${t('com.label.del')}` /*선택삭제*/, buttonClass: 'default mob_default' }"
                @click="scanRemove" :disabled="disableWhenScanIsOn" />
        </div>
        <!--- E : 버튼 -->

        <!--  S : AUI Grid -->
        <div id="auiGrid" class="mobile mt5">
            <AUIGrid ref="myGrid1" :columnLayout="columnLayout1" :gridProps="gridProps" :footerLayout="footerLayout"
                @cellDoubleClick="fnCellDoubleClick" @cellEditEnd="cellEditEnd" @cellEditBegin="cellEditBegin" />
        </div>
        <!--  E : AUI Grid -->
    </div>
</template>
