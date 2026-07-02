<script setup lang="ts">
import AUIGrid from '@/static/AUIGrid-Vue.js/AUIGrid.vue';
import { getCurrentInstance, onActivated, onMounted, reactive, ref } from 'vue';
import api from '@/common/axios/api';
import moment from 'moment';
import { AUIGridDefault } from '@/common/utils/AUIGridDefault';

// 입고확정일때만
let grid;
const myGrid = ref(null);
const props = defineProps(['props']);
/** 팝업 핸들러 */
const instance = getCurrentInstance();
const popup = instance.appContext.config.globalProperties.$popup;
const popupHandler = ({
    type = 'search' || 'mobileAlert' || 'mobileConfirm',
    componentType = null,
    msg = null,
    props,
    ok,
    cancel,
}) => {
    popup({
        type,
        msg,
        componentType,
        props,
        ok,
        cancel,
    });
};

/** 그리드 속성 정의 */
const gridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: 480,
        noDataMessage: '출력할 데이터가 없습니다.',
        rowIdField: 'itemCd',
        rowIdTrustMode: true,
    })
    .build();
const columnLayout = [
    { dataField: 'itemCd', headerText: '품목코드' },
    { dataField: 'itemNm', headerText: '품목명', width: 70 },
    { dataField: 'ordQty', headerText: '주문수량', width: 53 },
    { dataField: 'inQty', headerText: '입고수량', width: 53 },
    {
        dataField: 'minusQty',
        headerText: '차이수량',
        width: 53,
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) =>
            Number(item.inQty) - Number(item.ordQty),
    },
];

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
    keyboardText: '키보드 켜기',
};
const inputData = reactive({ ...inputDataState });
const validate = reactive({ ...validateState });

/** 바코드 데이터, props 관리 */
const cacheVariable = reactive({
    params: props.props,
    barcodeUpdate: [],
    barcodeInsert: [],
});

/** 조회 */
const retrieve = () => {
    const params = {
        ...cacheVariable.params,
    };
    myGrid.value.showAjaxLoader();
    api.post('/api/v1/biz/mobile/mobilePurchaseDetailList', params)
        .then((res) => res?.result)
        .then(myGrid.value.setGridData)
        .then(myGrid.value.removeAjaxLoader)
        .catch(console.error);
};

/** 유통이력번호 스캔 */
const distrHistoryScan = (e) => {};

/** 바코드 스캔, 스캔할 때 마다 저장 */
const barcodeScan = async (e) => {
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(e.target.value)) {
        return Object.assign(inputData, { resultMsg: '영문키보드로 바꿔서 진행해주세요.' });
    }
    if (e.target.value.trim() === '') return (inputData.resultMsg = '존재하지 않는 바코드입니다.');

    const params = {
        slipNo: cacheVariable.params.slipNo,
        purchCustCd: cacheVariable.params.purchCustCd,
        barcodeNo: e.target.value,
    };
    inputData.barcodeInput = null;

    const result = await api
        .post('/api/v1/biz/mobile/mobilePurchaseBarcode', params)
        .then((res) => res?.result)
        .catch(console.error);

    if (result == null) return (inputData.resultMsg = '존재하지 않는 바코드입니다.');
    else if (result.errorCode == 4001)
        return (inputData.resultMsg = '협력사 지역별 바코드규칙정보가 존재하지 않습니다.');
    else if (result.errorCode == 4002)
        return (inputData.resultMsg = '외부품목코드 연결이 안됩니다.');

    /** 바코드 스캔하고 api통신 후 값 세팅하고 캐시에 저장 */
    const scanData = {
        ...params,
        // itemCd: null,
        // extItemCd: null,
        // inQty: null,
        // inWtQty: null,
        // inAmt: null,
        // outQty: null,
        // outWtQty: null,
        // outAmt: null,
        // saleUnitPrice: null,
        // pruchUnitPrice: null,
        // slaugterDate: null,
        // producDate: null,
        // factCompany: null,
        // distrHistoryNo: null,
        // weight: null,
        ...result,
    };

    if (!myGrid.value.getGridData().some((val) => val.itemCd == result.itemCd)) {
        /** 매핑되는 품목코드가 없을 시 새로운 주문을 생성해야함 */
        popupHandler({
            type: 'mobileConfirm',
            msg: '기존에 존재하지 않는 품목입니다. \r\n주문생성을 하시겠습니까?',
            ok: () => {
                cacheVariable.barcodeInsert.push(scanData);
                myGrid.value.addRow(scanData);
                document.getElementById('barcodeInput').focus();
            },
        });
    } else {
        /** 기존꺼에 추가 */
        cacheVariable.barcodeUpdate.push(scanData);
        myGrid.value.updateRowsById([
            {
                itemCd: result.itemCd,
                inQty:
                    Number(myGrid.value.getItemByRowId(result.itemCd)?.inQty) +
                    Number(result.inQty),
            },
        ]);
    }
};

/** 개체식별 라디오버튼 핸들러 */
const radioControl = (e) => {
    if (e.target.id === 'radio01') {
        validate.barcodeFlag = false;
    } else if (e.target.id === 'radio02') {
        validate.barcodeFlag = true;
    }
    /** input 초기화 */
    Object.assign(inputData, inputDataState);
};

const removeCheck = (e) => {};

/** 스캔시작 */
const scanStart = (e) => {
    document.getElementById('barcodeInput').focus();
};
/** 입고확정 */
const saveData = (e) => {
    const params = {
        insert: cacheVariable.barcodeInsert,
        update: cacheVariable.barcodeUpdate,
    };
    return;

    api.post('/api/v1/biz/mobile/saveData', params)
        .then((res) => res?.result)
        .then(console.log)
        .catch(console.error);
};
/** 키보드 온/오프 */
const keyboardControl = (e) => {
    if (validate.keyboardFlag) {
        validate.keyboardText = '키보드 켜기';
    } else {
        validate.keyboardText = '키보드 끄기';
    }

    validate.keyboardFlag = !validate.keyboardFlag;
};

onMounted(() => {
    grid = myGrid.value;
});
onActivated(() => {
    retrieve();
});
</script>

<template>
    <div id="container">
        <table class="tableLayout">
            <colgroup>
                <col style="width: 20%" />
                <col style="width: 30%" />
                <col style="width: 20%" />
                <col style="width: 30%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>입고일자</th>
                    <td>{{ moment(cacheVariable.params.searchDate).format('YYYY-MM-DD') }}</td>
                    <th>전표번호</th>
                    <td class="slipNo">{{ cacheVariable.params.slipNo.substr(4, 17) }}</td>
                </tr>
                <tr>
                    <th>물류센터</th>
                    <td>{{ cacheVariable.params.purchCustNm }}</td>
                    <th>매입처</th>
                    <td>{{ cacheVariable.params.inWhCustNm }}</td>
                </tr>
            </tbody>
        </table>
        <!--- S : 개체식별 -->
        <div class="M_SearchBox mt20">
            <ul class="SearchInner">
                <li class="radioWrap">
                    <span class="label">개체식별</span>
                    <div class="form_wrap">
                        <span class="form_cell form_radio">
                            <input
                                id="radio01"
                                type="radio"
                                name="a1"
                                checked
                                @change="radioControl"
                            />
                            <label for="radio01">
                                <span>개체</span>
                            </label>
                        </span>
                    </div>
                    <div class="form_wrap">
                        <span class="form_cell form_radio" @change="radioControl">
                            <input id="radio02" type="radio" name="a1" />
                            <label for="radio02">
                                <span>개체 + 제품</span>
                            </label>
                        </span>
                    </div>
                    <div class="form_wrap">
                        <span class="form_cell form_check login">
                            <input id="check01" type="checkbox" @change="removeCheck" />
                            <label for="check01" class="checkbox">
                                <span>삭제</span>
                            </label>
                        </span>
                    </div>
                </li>
            </ul>
        </div>
        <!--- E : 개체식별 -->

        <!--- S : 버튼 -->
        <div class="btn_area_m">
            <button type="button" class="default mob_default" @click="scanStart">
                <span>스캔시작</span>
            </button>
            <button type="button" class="default mob_default" @click="saveData">
                <span>입고확정</span>
            </button>
            <button type="button" class="default mob_default" @click="keyboardControl">
                <span>{{ validate.keyboardText }}</span>
            </button>
        </div>
        <!--- E : 버튼 -->
        <table class="tableLayout mt20">
            <colgroup>
                <col style="width: 20%" />
                <col style="width: 80%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>바코드</th>
                    <td>
                        <input
                            id="barcodeInput"
                            v-model="inputData.barcodeInput"
                            type="text"
                            style="border: 1px solid #ccc; outline: none"
                            autocomplete="off"
                            :inputmode="validate.keyboardFlag ? '' : 'none'"
                            @keydown.enter="barcodeScan"
                        />
                    </td>
                </tr>
                <tr>
                    <th>식별번호</th>
                    <td>
                        <input
                            id="distrHistoryInput"
                            v-model="inputData.distrHistoryInput"
                            type="text"
                            style="border: 1px solid #ccc; outline: none"
                            autocomplete="off"
                            :inputmode="validate.keyboardFlag ? '' : 'none'"
                            :disabled="!validate.barcodeFlag"
                            @keydown.enter="distrHistoryScan"
                        />
                    </td>
                </tr>
                <tr>
                    <th>메세지</th>
                    <td>
                        <span class="error_text">{{ inputData.resultMsg }}</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <!--  S : AUI Grid -->
        <div id="auiGrid" class="mobile">
            <AUIGrid ref="myGrid" :column-layout="columnLayout" :grid-props="gridProps" />
        </div>
    </div>
</template>

<style scoped>
.slipNo {
    font: 400 10px/15px 'Pretendard' !important;
}
</style>
