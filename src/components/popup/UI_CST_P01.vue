<script setup lang="ts">
/*
 * @file     UI_CST_P01.vue
 * @menu     거래처 선택 팝업
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted } from 'vue';
import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps } from '@/static/AUIGrid/AUIGridDefault';

import { useI18n } from 'vue-i18n'; // 다국어

import ComSelectbox from '@/components/form/ComSelectbox.vue'; // 선택박스 box
import ComInputbox from '@/components/form/ComInputbox.vue'; // 텍스트 box
import ComButton from '@/components/form/ComButton.vue';

import { usePopupStore } from '@/common/stores/popup';

import { selectPopupCustomerList } from '@/api/customer'; //backend
import { utils } from '@/common/utils';
// =================================================================
// 변수 선언 영역
// =================================================================
// 메세지 변수
const { t } = useI18n();

const props = defineProps<{
    id: string;
    param: Record<string, any>;
    onOk?: (data: any) => void | Promise<void>;
}>();

const searchParameter = ref({
    ...(props.param ?? {}),
});
const custCdRef = ref<any>(null);
const custTypeCdRef = ref();

// 공통코드
const GLB150 = JSON.parse(localStorage.getItem('GLB150') ?? '[]');
const GLB200 = JSON.parse(localStorage.getItem('GLB200') ?? '[]');

// 그리드
const myGrid = ref<any>(null); // aui grid 변수
const popup = usePopupStore();
// ==================================================
// 그리드 영역
// ==================================================

const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({ height: 530 })
    .build();
const columnLayout = [
    { dataField: 'custCd', headerText: t('customer.label.custCode'), width: '7%' }, // 거래처코드
    {
        dataField: 'custNm',
        headerText: t('customer.label.custName'),
        style: 'gridTextAlignLeft',
        width: '23%',
    }, // 거래처명
    {
        dataField: 'bizerNm',
        headerText: t('customer.label.businessName'),
        style: 'gridTextAlignLeft',
        width: '23%',
    }, // 사업자명
    {
        dataField: 'custTypeCd',
        headerText: t('customer.label.custType'), // 거래처유형
        width: '8%',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            let columnValue;
            GLB150.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    },
    {
        dataField: 'bizerNo',
        headerText: t('customer.label.businessNumber'), // 사업자번호
        width: '9%',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            return _value
                ?.replace(/\D/g, '')
                .slice(0, 10)
                .replace(/(\d{1,3})(\d{1,2})(\d{1,5})/, '$1-$2-$3');
        },
    },
    {
        dataField: 'telNo',
        headerText: t('com.label.telNo'), // 전화번호
        width: '10%',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            const digitsOnly = _value?.replace(/\D/g, '');
            if (!digitsOnly) {
                return '';
            }
            return utils.stringUtil.getFormatTelNo(digitsOnly); // 번화번호 유효성
        },
    },
    {
        dataField: 'whcenterNm',
        headerText: t('customer.label.assignLogisticsCenter'),
        style: 'gridTextAlignLeft',
    }, // 담당물류센터
    {
        dataField: 'tranStatCd',
        headerText: t('customer.label.tradeStatus'), // 거래상태
        width: '6%',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            let columnValue;
            GLB200.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    },
];

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

// 초기화
const reset = function () {
    searchParameter.value.custCd = '';
    searchParameter.value.custNm = '';
    searchParameter.value.ownerNm = '';
    searchParameter.value.bizerNo = '';
};

// 조회
const search = function () {
    myGrid.value.showAjaxLoader();

    const params = {
        ...searchParameter.value,
        show: props.param.show,
    };

    selectPopupCustomerList(params)
        .then((res) => {
            // 그리드 데이터 삽입
            myGrid.value.setGridData(res?.data?.result);
            myGrid.value.removeAjaxLoader();
        })
        .catch((e) => {
            myGrid.value.removeAjaxLoader();
            popup.alert(e.message);
        });
};

// 선택
const select = async () => {
    const item = myGrid.value.getSelectedRows();
    if (item.length == 0) {
        popup.alert(t('com.message.selectItemL', [t('com.label.cust')])); // 거래처를 선택해주세요.
    } else {
        popup.closePopup(props.id, item);
    }
};

// 행 더블클릭 이벤트
const rowSelect = async (event: any) => {
    popup.closePopup(props.id, event.item);
};

// ==================================================
// Hook 영역
// ==================================================

onMounted(() => {
    searchParameter.value.custCd = props.param.custCd || '';
    searchParameter.value.custTypeCd = props.param.custTypeCd || '';
    searchParameter.value.userTypeCd = props.param.userTypeCd || '';
    // 거래처유형 값이 있으면 선택 못하게 막기
    if (!(props.param.custTypeCd == '' || props.param.custTypeCd == null)) {
        Object.assign(custTypeCdRef.value.style, {
            pointerEvents: 'none',
            opacity: '1',
            cursor: 'not-allowed',
        });
    }
    searchParameter.value.ownerNm = '';
    searchParameter.value.bizerNo = '';

    search();

    // 거래처명 포커스 맞추기
    custCdRef.value.setFocus();
});
</script>

<template>
    <div class="popup-main">
        <div class="popup-container">
            <div class="titleWrap">
                <div class="pageTitle">
                    <!--거래처정보-->
                    <h2>{{ t('customer.label.custInfo') }}</h2>
                </div>

                <div class="btn_area">
                    <!-- 초기화 -->
                    <ComButton :params="{ name: t('com.label.reset') }" @click="reset" />
                    <!-- 조회 -->
                    <ComButton :params="{ name: t('com.label.search') }" @click="search" />
                    <!-- 선택 -->
                    <ComButton :params="{ name: t('com.label.select') }" @click="select" />
                </div>
            </div>

            <!--- S : 검색조건 -->
            <div class="SearchBox popup_search">
                <ul class="SearchInner">
                    <li>
                        <div class="search_container">
                            <!--거래처명-->
                            <ComInputbox
                                ref="custCdRef"
                                v-model.trim="searchParameter.custCd"
                                :label="t('customer.label.custName')"
                                maxlength="50"
                                @enter="search"
                            />
                        </div>
                    </li>
                    <li>
                        <div ref="custTypeCdRef" class="search_container">
                            <!-- 거래처유형 -->

                            <ComSelectbox
                                v-model="searchParameter.custTypeCd"
                                :label="t('customer.label.custType')"
                                :select-type="'A'"
                                :options="GLB150"
                            />
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!--대표자명-->
                            <ComInputbox
                                v-model.trim="searchParameter.ownerNm"
                                :label="t('com.label.ownerName')"
                                maxlength="50"
                                @enter="search"
                            />
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!--사업자번호-->
                            <ComInputbox
                                v-model.trim="searchParameter.bizerNo"
                                :label="t('customer.label.businessNumber')"
                                maxlength="50"
                                @enter="search"
                            />
                        </div>
                    </li>
                </ul>
            </div>
            <!--- E : 검색조건 -->

            <!--  S : AUI Grid -->

            <!--거래처정보-->
            <div id="popup-grid">
                <AUIGrid
                    ref="myGrid"
                    :column-layout="columnLayout"
                    :grid-props="gridProps"
                    @cell-double-click="rowSelect"
                />
            </div>
            <!--  E : AUI Grid -->
        </div>
    </div>
</template>
