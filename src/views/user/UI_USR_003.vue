<script setup lang="ts">
/*
 * @file     UI_USR_003.vue
 * @menu     사용자 로그 조회
 * @author   astems
 * @since    2026-06-30
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { reactive, ref, onMounted } from 'vue';
import { utils } from '@/common/utils';
import { useI18n } from 'vue-i18n'; // 다국어
import dayjs from 'dayjs';

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps } from '@/static/AUIGrid/AUIGridDefault';

// 공통모듈
import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import SearchArea from '@/components/menu/SearchArea.vue'; // 조회조건 영역
import ComInputbox from '@/components/form/ComInputbox.vue'; // 텍스트 box
import DatePeriod from '@/components/search/DatePeriod.vue'; // 날짜기간
import ComButton from '@/components/form/ComButton.vue';

import { useLayoutStore } from '@/common/stores/layout'; // 레이아웃 store

import { selectUserLoginLog, selectLogByDate } from '@/api/user'; //backend

// ==================================================
// 변수 선언 영역
// ==================================================

// 메인화면은 필수 - 메뉴정보를 받기 위한 props
defineProps<{
    menuInfo: any;
    params: Record<string, any>;
}>();

// 메세지 변수
const { t } = useI18n();
const layoutStore = useLayoutStore();

const EAT050 = JSON.parse(localStorage.getItem('EAT050') ?? '[]');

const defaultSearchState = () => ({
    searchDateStart: new Date(),
    searchDateEnd: new Date(),
    searchId: '',
    searchNm: '',
});
const searchBox = reactive(defaultSearchState());

// ==================================================
// 그리드 영역
// ==================================================
const myGrid = ref<any>(null);
const myGridDtl = ref<any>(null);
//그리드 높이 계산
const gridResizeHeight = layoutStore.layoutHeight - utils.biz.MENU_LAYOUT.S; // 메인 화면 높이에서 그리드를 제외한 영역을 빼줘야 함...

const gridPropsBasic: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: gridResizeHeight,
        selectionMode: 'singleRow', // 셀 선택모드
    })
    .build();
const gridPropsDtl: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: gridResizeHeight,
        selectionMode: 'multipleRows',
    })
    .build();
const columnLayout = [
    {
        dataField: 'logdate',
        headerText: t('user.label.loginDate'),
        dataType: 'date',
        dateInputFormat: 'yyyy-mm-dd', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd', // 그리드에 보여줄 날짜 형식
    }, // 접속일자
    { dataField: 'userId', headerText: t('com.label.userId'), style: 'gridTextAlignLeft' }, // 사용자ID
    { dataField: 'userNm', headerText: t('com.label.userName'), style: 'gridTextAlignLeft' }, // 사용자명
    {
        dataField: 'userTypeCd',
        headerText: t('user.label.groupName'),
        style: 'gridTextAlignLeft',
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
            EAT050.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    }, // 그룹명
    {
        dataField: 'alCountLogdate',
        headerText: t('com.label.cnt'),
        width: '15%',
        dataType: 'numeric',
        style: 'gridTextAlignRight',
        formatString: '#,##0',
    }, // 건수
];

const columnLayoutDtl = [
    {
        dataField: 'alLogtime',
        headerText: t('user.label.loginDtm'),
        dataType: 'date',
        dateInputFormat: 'yyyy-mm-dd HH:MM:ss', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd HH:MM:ss', // 그리드에 보여줄 날짜 형식
    }, // 접속일시
    { dataField: 'logip', headerText: t('user.label.loginIp'), style: 'gridTextAlignLeft' }, //접속IP
    { dataField: 'loginInOutLog', headerText: t('user.label.loginYn'), style: 'gridTextAlignLeft' }, //로그인여부
];

// ==================================================
// 사용자 정의 함수 영
// ==================================================

/**초기화 버튼*/
const reset = () => {
    Object.assign(searchBox, defaultSearchState());
    myGrid.value?.clearGridData();
    myGridDtl.value?.clearGridData();
};

/** 접속정보 조회  */
const search = async () => {
    const grid = myGrid.value;
    const gridDtl = myGridDtl.value;

    gridDtl?.clearGridData();
    grid?.showAjaxLoader();

    try {
        const params = {
            userId: searchBox.searchId,
            userNm: searchBox.searchNm,
            searchDateStart: dayjs(searchBox.searchDateStart).format('YYYYMMDD'),
            searchDateEnd: dayjs(searchBox.searchDateEnd).format('YYYYMMDD'),
        };
        const res = await selectUserLoginLog(params);
        grid?.setGridData(res?.data?.result ?? []);
    } catch (e) {
        console.error('Search failed', e);
    } finally {
        grid?.removeAjaxLoader();
    }
};

// 그리드 셀 선택
const fn_selectionChange = (event: any) => {
    if (event.primeCell) drawDtl(event.primeCell.item);
};

/** 접속로그 조회  */
const drawDtl = async (item: any) => {
    const gridDtl = myGridDtl.value;
    if (!item?.userId || !item?.logdate) return;

    const params = {
        userId: item.userId,
        logdate: String(item.logdate)
            .trim()
            .replace(/[^0-9]/g, ''),
    };

    gridDtl?.showAjaxLoader();
    try {
        const result = await selectLogByDate(params);
        gridDtl?.setGridData(result?.data?.result ?? []);
    } finally {
        gridDtl?.removeAjaxLoader();
    }
};

/** 개월 선택 버튼 */
const searchPeriod = (period: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - period);
    searchBox.searchDateEnd = endDate;
    searchBox.searchDateStart = startDate;
};

// ==================================================
// Hook 영역
// ==================================================
onMounted(() => {
    myGrid.value?.clearGridData();
    myGridDtl.value?.clearGridData();
});
</script>

<template>
    <!-- 메뉴&공통버튼영역 -->
    <!-- 초기화, 조회 -->
    <MenuTop ref="menuTopRef" :menu-info="$props.menuInfo" :methods="{ reset, search }" />

    <MenuContent>
        <SearchArea>
            <!--- S : 검색조건 -->
            <li>
                <div class="search_container">
                    <!-- 접속일자 -->
                    <DatePeriod
                        v-model="searchBox"
                        :params="{ label: t('user.label.loginDate') }"
                        start-dt-key="searchDateStart"
                        end-dt-key="searchDateEnd"
                    />
                </div>
            </li>
            <li>
                <div class="search_container">
                    <!-- 1개월 -->
                    <ComButton :text="t('com.label.months', [1])" @click="searchPeriod(1)" />
                    <!-- 3개월 -->
                    <ComButton :text="t('com.label.months', [3])" @click="searchPeriod(3)" />
                    <!-- 6개월 -->
                    <ComButton :text="t('com.label.months', [6])" @click="searchPeriod(6)" />
                    <!-- 12개월 -->
                    <ComButton :text="t('com.label.months', [12])" @click="searchPeriod(12)" />
                </div>
            </li>
            <li>
                <div class="search_container">
                    <!-- 사용자ID-->
                    <ComInputbox
                        v-model="searchBox.searchId"
                        :label="t('com.label.userId')"
                        @keydown.enter="search"
                    />
                </div>
            </li>
            <li>
                <div class="search_container">
                    <!-- 사용자명-->
                    <ComInputbox
                        v-model="searchBox.searchNm"
                        :label="t('com.label.userName')"
                        @keydown.enter="search"
                    />
                </div>
            </li>
        </SearchArea>

        <!--- E : 검색조건 -->

        <div class="halfDiv">
            <div>
                <div class="subTitle">
                    <!-- 접속정보 -->
                    <h3>{{ t('user.label.loginInfo') }}</h3>
                </div>
                <!--  S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGrid"
                        :column-layout="columnLayout"
                        :grid-props="gridPropsBasic"
                        @selection-change="fn_selectionChange"
                    />
                </div>
                <!--  E : AUI Grid -->
            </div>
            <div>
                <div class="subTitle">
                    <!-- 접속로그 -->
                    <h3>{{ t('user.label.loginLog') }}</h3>
                </div>
                <!--  S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGridDtl"
                        :column-layout="columnLayoutDtl"
                        :grid-props="gridPropsDtl"
                    />
                </div>
                <!--  E : AUI Grid -->
            </div>
        </div>
    </MenuContent>
</template>
