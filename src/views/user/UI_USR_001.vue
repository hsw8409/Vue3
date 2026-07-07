<script setup lang="ts">
/*
 * @file     UI_USR_001.vue
 * @menu     사용자조회
 * @author   astems
 * @since    2026-06-25
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, onMounted, reactive, inject, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps, type AUIGridProps } from '@/static/AUIGrid/AUIGridDefault';
import { utils } from '@/common/utils';

import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import SearchArea from '@/components/menu/SearchArea.vue'; // 조회조건 영역
import ComInputbox from '@/components/form/ComInputbox.vue'; // 텍스트 box
import ComSelectbox from '@/components/form/ComSelectbox.vue'; // 선택박스 box

import { useLayoutStore } from '@/common/stores/layout'; // 레이아웃 store
import { usePopupStore } from '@/common/stores/popup';
import { useCommonCodeStore } from '@/common/stores/commonCode';

import { selectUserList, randomPassword } from '@/api/user'; //backend

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================

// 메인화면은 필수 - 메뉴정보를 받기 위한 props
defineProps<{
    menuInfo: any;
    params: Record<string, any>;
}>();

// 메세지 변수
const { t } = useI18n();

const myGrid = ref<AUIGridProps | null>(null);
const userIdRef = ref<any>(null);
const userNameRef = ref<any>(null);

// 1. 상태를 초기화하는 함수를 별도로 분리 (권장)
const getInitialState = () => ({
    usrId: '',
    usrName: '',
    selectedType: '', // null 대신 빈 문자열 권장
    employmentStatus: '10',
});
// reactive 변수 초기화
const searchBox = reactive(getInitialState());

// 타입을 명시하여 주입
const addTab = inject<(params: any) => void>('addTab');

const newRegi = (i?: string) => {
    addTab?.({
        mcd: '01002002',
        fileNm: 'UI_USR_002.vue',
        params: {
            userId: i,
            mode: i ? 'edit' : 'new',
        },
    });
};

const commonCodeStore = useCommonCodeStore();
const EAT100 = computed(() => commonCodeStore.getCode('EAT100'));
const EAT050 = computed(() => commonCodeStore.getCode('EAT050'));
const EAT150 = computed(() => commonCodeStore.getCode('EAT150'));

const popupStore = usePopupStore();

// ==================================================
// 그리드 영역
// ==================================================

//그리드 높이 계산
const layoutStore = useLayoutStore();
const gridResizeHeight = layoutStore.layoutHeight - utils.biz.MENU_LAYOUT.S; // 메인 화면 높이에서 그리드를 제외한 영역을 빼줘야 함...

const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: gridResizeHeight,
    })
    .build();

// 그리드 칼럼 레이아웃
const columnLayout = [
    { dataField: 'userTypeCd', headerText: t('user.label.userTypeCode'), width: '5%' }, // 유형코드
    {
        dataField: 'userTypeCd',
        headerText: t('user.label.userTypeName'),
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
            EAT050.value.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
        width: '7%',
    }, // 유형명
    {
        dataField: 'userId',
        headerText: t('com.label.userId'),
        style: 'gridClickStyle',
        width: '10%',
    }, // 사용자ID
    {
        dataField: 'userNm',
        headerText: t('com.label.userName'),
        style: 'gridClickStyle',
        width: '10%',
    }, // 사용자명
    {
        dataField: 'employGbnFg',
        headerText: t('user.label.employFlag'),
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
            EAT100.value.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
        width: 140,
    }, // 재직구분
    { dataField: 'menuGrpCd', headerText: t('menu.label.menuGroupCode'), width: '7%' }, // 메뉴그룹코드
    {
        dataField: 'menuGrpNm',
        headerText: t('menu.label.menuGroupName'),
        style: 'gridTextAlignLeft',
        width: '10%',
    }, // 메뉴그룹명
    {
        dataField: 'deptCd',
        headerText: t('com.label.dept'),
        width: 100,
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
            EAT150.value.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    }, // 부서
    {
        dataField: 'enterDate',
        headerText: t('user.label.joinDate'),
        dataType: 'date',
        dateInputFormat: 'yyyymmdd', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd', // 그리드에 보여줄 날짜 형식
        width: '8%',
    }, // 입사일자
    {
        dataField: 'leaveDate',
        headerText: t('user.label.leaveDate'),
        dataType: 'date',
        dateInputFormat: 'yyyymmdd', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd', // 그리드에 보여줄 날짜 형식
        width: '8%',
    }, // 퇴사일자
    {
        dataField: 'updDtime',
        headerText: t('com.label.lastUpdDtm'),
        dataType: 'date',
        dateInputFormat: 'yyyymmdd HHMMss', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd HH:MM:ss', // 그리드에 보여줄 날짜 형식
        width: 180,
    }, // 최종수정일시
    {
        dataField: 'undefined',
        headerText: t('user.label.passwordInitialize'), // PW초기화
        width: 120,
        style: 'asdasd',
        renderer: {
            type: 'ButtonRenderer',
            labelText: t('user.label.passwordInitialize'), // PW초기화
            onClick: (e: any) => {
                popupStore.confirm(t('user.message.passwordInitializeConfirm'), undefined, {
                    onOk: async () => {
                        const passwd = generateRandomPassword(10);
                        randomPassword({ ...e.item, passwd })
                            .then(() => {
                                // "res-${passwd}"으로 초기화하였습니다.\n로그인 후 비밀번호 재설정 부탁드립니다.
                                popupStore.alert(
                                    t('user.message.procPasswordInitialize', [passwd]),
                                );
                            })
                            .then(search)
                            .catch((e) => popupStore.alert(e.message));
                    },
                });
            },
        },
    }, // pw초기화
];

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const reset = () => {
    Object.assign(searchBox, getInitialState());
    search();
};

// 조회 버튼
const search = () => {
    const grid = myGrid.value;

    if (
        utils.stringUtil.getByteB(searchBox.usrId) > 20 ||
        utils.stringUtil.getByteB(searchBox.usrName) > 50
    ) {
        // 입력한 값이 너무 깁니다.
        popupStore.alert(t('com.message.messageTooLong'));
        userIdRef.value.blur();
        userNameRef.value.blur();
        return;
    }

    const params = {
        userId: searchBox.usrId,
        userNm: searchBox.usrName,
        userTypeCd: searchBox.selectedType,
        employmentStatus: searchBox.employmentStatus,
    };

    // 조회
    selectUserList(params)
        .then((res) => {
            grid?.setGridData(res?.data?.result ?? []);
        })
        .catch((e) => {
            popupStore.alert(e.message);
        }); // <-- 여기에 있던 세미콜론(;)을 제거해야 합니다.
};

// 패스워드 초기화
const generateRandomPassword = (length: number) => {
    const charset = utils.biz.PASSWORD_RANDOM_KEY;
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

// 사용자등록 페이지 이동
const pageChange = () => {
    const grid = myGrid.value;
    if (!grid) return;

    const selectedItems = grid.getSelectedItems();
    if (!selectedItems.length) return;

    const { item, columnIndex } = selectedItems[0];

    if (columnIndex === 2 || columnIndex === 3) {
        newRegi(item.userId);
    }
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
onMounted(() => {
    myGrid.value?.clearGridData();
    // 화면 로드시 조회
    search();
});
</script>

<template>
    <!-- 메뉴&공통버튼영역 -->
    <!-- 초기화, 조회, 신규 -->
    <MenuTop ref="menuTopRef" :menu-info="$props.menuInfo" :methods="{ reset, search, newRegi }" />

    <MenuContent>
        <!--- S : 검색조건 -->
        <SearchArea>
            <li>
                <div class="search_container">
                    <!-- 사용자유형 -->
                    <ComSelectbox
                        v-model="searchBox.selectedType"
                        :label="t('com.label.userType')"
                        :select-type="'A'"
                        :options="EAT050"
                    />
                </div>
            </li>
            <li>
                <div class="search_container">
                    <!-- 재직구분 -->
                    <ComSelectbox
                        v-model="searchBox.employmentStatus"
                        :label="t('user.label.employFlag')"
                        :select-type="'A'"
                        :options="EAT100"
                    />
                </div>
            </li>
            <li>
                <div class="search_container">
                    <!-- 사용자ID -->
                    <ComInputbox
                        ref="userIdRef"
                        v-model="searchBox.usrId"
                        :label="t('com.label.userId')"
                        :maxlength="20"
                        @enter="search"
                    />
                </div>
            </li>
            <li>
                <div class="search_container">
                    <!-- 사용자명 -->
                    <ComInputbox
                        ref="userNameRef"
                        v-model="searchBox.usrName"
                        :label="t('com.label.userName')"
                        :maxlength="50"
                        @enter="search"
                    />
                </div>
            </li>
        </SearchArea>
        <!--- E : 검색조건 -->

        <!--  S : AUI Grid -->
        <div id="auiGrid">
            <AUIGrid
                ref="myGrid"
                :column-layout="columnLayout"
                :grid-props="gridProps"
                @cell-click="pageChange"
            />
        </div>
        <!--  E : AUI Grid -->
    </MenuContent>
</template>
