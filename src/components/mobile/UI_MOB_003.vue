<!--
 * @file     \components\mobile\UI_MOB_003.vue
 * @menu     물류/생산 - 장비 - 모바일출고 (메인 - 출고처리)
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
import AUIGrid from '@/static/AUIGrid-Vue.js/AUIGrid.vue';
import { biz } from '@/common/utils/biz'; // 공통 utils
import { useI18n } from 'vue-i18n'; // 다국어
import { AUIGridDefault } from '@/common/utils/AUIGridDefault';
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
import moment from 'moment';
import TokenService from '@/common/service/token';

import TextBox from '@/components/template/text/TextBox.vue';
import PopupMenuButton from '@/components/template/button/PopupMenuButton.vue'; // 팝업메뉴버튼
import DateSelectInput from '@/components/template/etc/DateSelectInput.vue'; // 달력
import ComboSelectInput from '@/components/template/combo/ComboSelectInput.vue'; // 텍스트박스
import CheckBoxSelect from '@/components/template/checkbox/CheckBoxSelect.vue'; // 체크박스

import {
    selectWHCenterGroup /*물류센터목록*/,
    mobileOrderList /*1일조회*/,
    mobileOrderListPeriod /*기간조회*/,
} from '@/api/mobile';
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

const myGrid = ref(null);
const selectedCenter = ref(null);
const center = ref(null);

const COM110 = JSON.parse(localStorage.getItem('COM110')); // 주문구분
const COM100 = JSON.parse(localStorage.getItem('COM100')); // 주문진행상태
const check01 = null;
const labelFunction = (data, value) => {
    return data.find((val) => val.dtlCommCd == value)?.dtlCommNm;
};
/** 팝업 핸들러 */
const instance = getCurrentInstance();
const api = instance.appContext.config.globalProperties.$queue;
const popup = instance.appContext.config.globalProperties.$popup;
const popupHandler = ({
    type = 'search' || 'mobileAlert' || 'mobileConfirm',
    componentType = null,
    msg = null,
    props,
    ok,
    cancel,
    value,
}) => {
    // if (value != null && value != "" && componentType != null) {
    switch (componentType) {
        case 'UICSTP01':
            Object.assign(searchParam, {
                ...searchParam,
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

const openMsg = () => popupHandler({ type: 'alert', componentType: 'mobile', msg: 'test' });

// 검색 조건
const searchParamState = {
    sellerCustNm: null,
    searchDate: new Date(),
    periodChecked: false,
};

const searchParam = reactive({ ...searchParamState });

/** 셀 클릭 관련 */
const emit = defineEmits(['goPage']);
const emitParam = reactive({
    target: { _value: 'UI_MOB_003P01' },
    props: {
        ...searchParam,
        slipNo: null,
    },
});

// ||==================================================||
// ||그리드 영역                                         ||
// ||==================================================||
const gridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        noDataMessage: t('com.message.noDataOutput'), // 출력할 데이터가 없습니다.
        // height: 498,
        height: '100%',
        showFooter: true,
    })
    .build();
const columnLayout = [
    {
        dataField: 'sellerCustNm',
        headerText: t('com.label.salesCust') /*매출처*/,
        style: 'gridTextAlignLeft',
    },
    // { dataField: "outWhCustNm", headerText: "물류센터", width: 60, show: false },
    {
        dataField: 'ordGbnFg',
        headerText: t('com.label.flag') /*구분*/,
        width: 40,
        labelFunction: (rowIndex, columnIndex, value, headerText, item) =>
            labelFunction(COM110, value),
    },
    {
        dataField: 'targetCnt',
        headerText: t('com.label.item') /*품목*/,
        width: 35,
        formatString: '#,##0',
        style: 'gridTextAlignRight',
    },
    {
        dataField: 'outQtySum',
        headerText: t('com.label.outbound') /*출고*/,
        width: 35,
        formatString: '#,##0',
        style: 'gridTextAlignRight',
    },
    {
        dataField: 'procStatFg',
        headerText: t('dashboard.label.progressState') /*진행상태*/,
        width: 80,
        labelFunction: (rowIndex, columnIndex, value, headerText, item) =>
            labelFunction(COM100, value),
    },
];
const footerLayout = [
    {
        labelText: t('com.label.sum') /*계*/,
        // positionField: "#base",
        positionField: 'sellerCustNm',
        colSpan: 3,
        style: 'aui-grid-my-column',
    },
    {
        dataField: 'targetCnt',
        positionField: 'targetCnt',
        style: 'textRight',
        operation: 'SUM',
        colSpan: 2,
        formatString: '#,##0',
    },
];

// ||==================================================||
// ||사용자 정의 함수 영역                                ||
// ||==================================================||
/** 상세조회 */
const searchDtl = (e) => {
    Object.assign(emitParam.props, {
        ...e.item,
        searchDate: searchParam.searchDate,
        viewDate: moment(searchParam.searchDate).format('YYYY-MM-DD'),
    });
    emit('goPage', emitParam);
};
const isChecked = () => {
    search();
};
/** 조회 */
const search = async () => {
    myGrid.value.showAjaxLoader();

    const params = {
        ...searchParam,
        searchDate: moment(searchParam.searchDate).format('YYYYMMDD'),
        whCustCd: selectedCenter.value,
    };

    try {
        // ✅ 조건에 따라 바로 API 선택
        const fn = searchParam.periodChecked ? mobileOrderListPeriod : mobileOrderList;
        const res = await fn(params);

        myGrid.value.setGridData(res?.data?.result ?? res?.result ?? []);
    } catch (e) {
        console.error(e);
    } finally {
        myGrid.value.removeAjaxLoader();
    }
};
const centerList = async () => {
    try {
        const res = await selectWHCenterGroup({ loginChainCd: TokenService.getUser().chainCd });
        center.value = res?.result.map((v) => ({ ...v, dtlCommCd: v.custCd, dtlCommNm: v.custNm }));
        selectedCenter.value = res?.result[0].custCd;
        labelFg.whCust = res?.result;
    } catch (e) {
        //
    }
};
// ||==================================================||
// ||Hook 영역                                          ||
// ||==================================================||
onMounted(async () => {
    // openMsg();
    await centerList();
    search();
});
</script>

<template>
    <div id="container" class="poAbsolMView">
        <div class="M_SearchBox">
            <ul class="SearchInner">
                <li>
                    <div class="form_wrap">
                        <div class="select_wrap flex_left">
                            <label>{{ t('adjust.label.logisticsCenter') /*물류센터*/ }}</label>
                            <div class="select-custom">
                                <ComboSelectInput
                                    v-model="selectedCenter"
                                    :params="{
                                        selectType: '',
                                        divClass: 'select-custom',
                                        selectClass: 'select ww160',
                                    }"
                                    :options="center"
                                />
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <div class="form_wrap mr10 flex_left">
                            <!--  품목 코드/명 -->
                            <TextBox
                                ref=""
                                v-model.trim="searchParam.sellerCustNm"
                                :params="{
                                    label: t('customer.label.salesCustName'),
                                    spanClass: 'form_cell form_input ww160 search',
                                }"
                                maxlength="50"
                                @enter="search"
                            />
                        </div>
                    </div>
                </li>
                <li>
                    <div class="form_wrap">
                        <label>{{ t('aggregration.label.outboundDate') /*출고일자*/ }}</label>
                        <div class="datePickerClass mr10" id="priceDate">
                            <span class="form_cell form_input ww160">
                                <DateSelectInput
                                    v-model="searchParam.searchDate"
                                    :weekStartsOn="0"
                                    inputFormat="yyyy-MM-dd"
                                />
                            </span>
                        </div>
                        <div class="form_wrap">
                            <CheckBoxSelect
                                v-model="searchParam.periodChecked"
                                :params="{
                                    label: t('mobile.label.inclueds10Days') /*10일내포함*/,
                                    labelFor: 'check01',
                                }"
                                @change="isChecked"
                            />
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        <div class="btn_area_m mb10">
            <PopupMenuButton
                :params="{
                    name: t('com.label.search') /*조회*/,
                    buttonClass: 'default mob_default',
                }"
                @click="search"
            />
        </div>

        <span class="realDate mb10">
            <span class="showDate">
                {{ t('aggregration.label.outboundDate') /*출고일자*/ }} :
                {{ moment(searchParam.searchDate).format('YYYY.MM.DD') }}
                {{
                    searchParam.periodChecked
                        ? t('mobile.label.inclueds10DaysOrderConfirm') /*(10일내주문확정건 포함)*/
                        : ''
                }}
            </span>
        </span>
        <div id="auiGrid" class="mobile">
            <AUIGrid
                ref="myGrid"
                :columnLayout="columnLayout"
                :gridProps="gridProps"
                @cellClick="searchDtl"
                :footerLayout="footerLayout"
            />
        </div>
    </div>
</template>
