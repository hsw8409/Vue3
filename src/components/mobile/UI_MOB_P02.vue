<script setup>
import AUIGrid from '@/static/AUIGrid-Vue.js/AUIGrid.vue';
import Datepicker from 'vue3-datepicker';
import tokenService from '@/common/service/token';
import { AUIGridDefault } from '@/common/utils/AUIGridDefault';
import { ko } from 'date-fns/locale';
import { computed, getCurrentInstance, onMounted, reactive, ref, toRef, watchEffect } from 'vue';

// 현재 컴포넌트 인스턴스 가져오기
import api from '@/common/axios/api';

const emit = defineEmits(['okClick', 'openAlert']);
const props = defineProps({
    param: ref(),
});

const searchParameter = ref(props.param);
const custCd = ref(null);

const GLB150 = JSON.parse(localStorage.getItem('GLB150')); //거래처유형

// 검색 조건
// const searchParameter = ref({
//     custCd: '',
//     custNm: '',
//     whCenterCd: '',
//     inPlanDate: new Date(),
// })
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
    // { dataField: "custCd", headerText: "거래처코드" },
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
        width: 70,
    },
    { dataField: 'whcenterNm', headerText: '물류센터', width: 70 },
];

watchEffect(() => {
    searchParameter.value.inPlanDate = `${inPlanDate.value.getFullYear()}${inPlanDate.value.getMonth() < 9 ? '0' + (inPlanDate.value.getMonth() + 1) : inPlanDate.value.getMonth() + 1}${inPlanDate.value.getDate() <= 9 ? '0' + inPlanDate.value.getDate() : inPlanDate.value.getDate()}`;
});

onMounted(() => {
    searchParameter.value.custCd = props.param.sellerCustCd || '';
    searchParameter.value.custTypeCd = props.param.custTypeCd || '';
    if (!(props.param.custTypeCd == '' || props.param.custTypeCd == null)) {
        custTypeCd.value.disabled = true;
    }
    // if (searchParameter.value.custCd) {
    retrieve();
    // }

    // custCd.value.focus()
    custCd.value.select();

    Object.assign(searchParameter, { custCd: props?.param?.value?.sellerCustCd });

    // api.post('/api/v1/biz/customer/selectCustomerList', { headers: { "Content-Type": `application/json` } }, searchParameter)
    //     .then((res) => {
    //         myGrid.value.setGridData(res?.result);
    //         myGrid.value.removeAjaxLoader();
    //     })
    //     .catch((e) => {
    //         popup({
    //             type: 'mobileAlert',
    //             msg: e.message,
    //         })
    //     });
});

const rowSelect = function (event) {
    emit('okClick', [event.item]);
};

const retrieve = function () {
    myGrid.value.showAjaxLoader();
    api.post(
        '/api/v1/biz/customer/selectCustomerListMobile',
        { ...searchParameter.value, show: props.param.show },
        { headers: { 'Content-Type': `application/json` } },
    )
        .then((res) => {
            // 그리드 데이터 삽입
            myGrid.value.setGridData(res?.result);
            myGrid.value.removeAjaxLoader();
        })
        .catch((e) => {
            myGrid.value.removeAjaxLoader();
            emit('openAlert', e.message);
        });
};
</script>

<template>
    <div id="container">
        <div class="title">
            <div class="titleWrap">
                <div class="pageTitle">
                    <!-- <h2>M_출고처리</h2> -->
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
                                    ref="custCd"
                                    v-model="searchParameter.custCd"
                                    type="text"
                                    placeholder="Search"
                                    @click="($event) => $event.target.select()"
                                    @keydown.enter="retrieve"
                                />
                                <button class="btn_input input_search" @click="retrieve">
                                    <span class="a11y">검색</span>
                                </button>
                            </span>
                        </div>
                        <!-- <div class="form_wrap flex_left">
                            <span style="display:inline-block; width: 144px;"> </span>
                            <span class="form_cell form_input">
                                <input type="text" v-model="searchParameter.custNm" readonly />
                            </span>
                        </div> -->
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
                :column-layout="columnLayout"
                :grid-props="gridProps"
                @cell-click="rowSelect"
            />
        </div>
        <!--  E : AUI Grid -->
    </div>
</template>
