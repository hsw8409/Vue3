<script setup>
import AUIGrid from '@/static/AUIGrid-Vue.js/AUIGrid.vue';
import Datepicker from 'vue3-datepicker';
import tokenService from '@/common/service/token';
import { AUIGridDefault } from '@/common/utils/AUIGridDefault';
import { ko } from 'date-fns/locale';
import { computed, getCurrentInstance, onMounted, reactive, ref, toRef, watchEffect } from 'vue';

// 현재 컴포넌트 인스턴스 가져오기
const instance = getCurrentInstance();
const api = instance.appContext.config.globalProperties.$api;

const GLB150 = JSON.parse(localStorage.getItem('GLB150')); //거래처유형

// 검색 조건
const searchParameter = ref({
    custCd: '',
    custNm: '',
    whCenterCd: '',
    inPlanDate: new Date(),
});
const inPlanDate = ref(new Date());

const locale = reactive(ko); // 달력

const myGrid = ref();
// 그리드 속성 정의
const gridProps = AUIGridDefault.gridPropsBuilder()
    // .withEditable(true)
    .withExtraProps({
        // showRowNumColumn: false,
        // showRowCheckColumn: true,
        // showRowAllCheckBox: false,
        // showStateColumn: true,
        height: 600,
    })
    .build();

const whCenterList = ref([]);

const columnLayout = [
    { dataField: 'custCd', headerText: '거래처코드' },
    { dataField: 'custNm', headerText: '거래처명칭', style: 'gridTextAlignLeft' },
    {
        dataField: 'custTypeCd',
        headerText: '거래처유형',
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
            let columnValue;
            GLB150.forEach(function (code) {
                if (code.dtlCommCd == value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    },
    { dataField: 'whcenterNm', headerText: '물류센터', style: 'gridTextAlignLeft' },
];

watchEffect(() => {
    searchParameter.value.inPlanDate = `${inPlanDate.value.getFullYear()}${inPlanDate.value.getMonth() < 9 ? '0' + (inPlanDate.value.getMonth() + 1) : inPlanDate.value.getMonth() + 1}${inPlanDate.value.getDate() <= 9 ? '0' + inPlanDate.value.getDate() : inPlanDate.value.getDate()}`;
});

onMounted(() => {
    api.post('/api/v1/biz/customer/selectCustomerList', {
        headers: { 'Content-Type': `application/json` },
    })
        .then((res) => {
            myGrid.value.setGridData(res?.result);
            myGrid.value.removeAjaxLoader();
        })
        .catch((e) => {
            popup({
                type: 'mobileAlert',
                msg: e.message,
            });
        });
});
</script>

<template>
    <div id="container">
        <div class="title">
            <div class="titleWrap">
                <div class="pageTitle">
                    <h2>M_출고처리</h2>
                </div>
                <div class="breadcrumb">
                    <button type="button">
                        <span class="a11y">처음으로</span>
                    </button>
                    <span>모바일</span>
                    <span>출고</span>
                    <span>M_출고처리</span>
                </div>
            </div>
        </div>

        <!--- S : 검색조건 -->
        <div class="M_SearchBox">
            <ul class="SearchInner">
                <li>
                    <div class="FindWrap2">
                        <div class="form_wrap mr10 flex_left">
                            <label style="width: 120px">매출처코드/명</label>
                            <span class="form_cell form_input search">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    v-model="searchParameter.custCd"
                                />
                                <button class="btn_input input_search" @click="popup_cstM01">
                                    <span class="a11y">검색</span>
                                </button>
                            </span>
                        </div>
                        <div class="form_wrap flex_left">
                            <span style="display: inline-block; width: 144px"></span>
                            <span class="form_cell form_input">
                                <input type="text" v-model="searchParameter.custNm" readonly />
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
        <div id="auiGrid" class="mobile">
            <AUIGrid
                ref="myGrid"
                :columnLayout="columnLayout"
                :gridProps="gridProps"
                @cellClick="showOutboudDetail"
            />
        </div>
        <!--  E : AUI Grid -->
    </div>
</template>
