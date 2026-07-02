<script setup lang="ts">
/**
 * @file     /components/popup/UI_USR_P01.vue
 * @menu     사용자찾기 팝업
 * @author   astems
 * @since    2026-06-29
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================

import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps } from '@/static/AUIGrid/AUIGridDefault';

// 메뉴 & 메뉴 공통 버튼 모듈
import ComButton from '@/components/form/ComButton.vue';
import ComInputbox from '@/components/form/ComInputbox.vue';
import ComSelectbox from '@/components/form/ComSelectbox.vue';
import { usePopupStore } from '@/common/stores/popup';
// api
import { selectUserList } from '@/api/user'; //backend
import { selectMenuGroup } from '@/api/menu';

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
const { t } = useI18n();
const popup = usePopupStore();

const props = defineProps<{
    id: string;
    param: Record<string, any>;
    onOk?: () => void | Promise<void>;
}>();

const EAT050 = JSON.parse(localStorage.getItem('EAT050') ?? '[]');
const EAT100 = JSON.parse(localStorage.getItem('EAT100') ?? '[]');
const EAT150 = JSON.parse(localStorage.getItem('EAT150') ?? '[]');

const menuGroupList = ref();

const searchParameter = ref({
    ...(props.param ?? {}),
});

// =====================================================================================================
// 그리드 영역
// =====================================================================================================

const myGrid = ref<any>(null);

// 그리드 속성 정의
const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withShowRowCheckColumn(true)
    .withExtraProps({ height: 509 })
    .build();

// 그리드 레이아웃
const columnLayout = [
    // 사용자ID
    {
        dataField: 'userId',
        headerText: t('com.label.userId'),
        style: 'gridTextAlignLeft',
        width: '12%',
    },
    // 사용자명
    {
        dataField: 'userNm',
        headerText: t('com.label.userName'),
        style: 'gridTextAlignLeft',
        width: '8%',
    },
    {
        dataField: 'employGbnFg',
        // 재직구분
        headerText: t('user.label.employFlag'),
        width: '7%',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            const columnValue = new Map(
                EAT100.map((item: any) => [item.dtlCommCd, item.dtlCommNm]),
            );
            return columnValue.get(_value) ?? '';
        },
    },
    {
        dataField: 'hpNo',
        // 핸드폰번호
        headerText: t('com.label.hpNo'),
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
            const telLen = digitsOnly.length;
            const twoTel = digitsOnly.slice(0, 2);
            if (telLen >= 12) {
                return digitsOnly.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3').slice(0, 14);
            } else if (telLen === 11) {
                return digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            } else if (twoTel == '02' && telLen === 10) {
                return digitsOnly.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
            } else if (twoTel == '02' && telLen === 9) {
                return digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
            } else {
                return digitsOnly.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/, '$1-$2-$3');
            }
        },
    },
    {
        dataField: 'telNo',
        // 집전화번호
        headerText: t('user.label.homeTelNo'),
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
            const telLen = digitsOnly.length;
            const twoTel = digitsOnly.slice(0, 2);
            if (telLen >= 12) {
                return digitsOnly.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3').slice(0, 14);
            } else if (telLen === 11) {
                return digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            } else if (twoTel == '02' && telLen === 10) {
                return digitsOnly.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
            } else if (twoTel == '02' && telLen === 9) {
                return digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
            } else {
                return digitsOnly.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/, '$1-$2-$3');
            }
        },
    },
    {
        dataField: 'userTypeCd',
        // 사용자<br/>유형
        headerText: `${t('com.label.user')}<br/>${t('com.label.type')}`,
        width: '7%',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            const columnValue = new Map(
                EAT050.map((item: any) => [item.dtlCommCd, item.dtlCommNm]),
            );
            return columnValue.get(_value) ?? '';
        },
    },
    {
        dataField: 'menuGrpCd',
        // 메뉴그룹
        headerText: t('menu.label.menuGroup'),
        style: 'gridTextAlignLeft',
        width: '15%',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            const columnValue = new Map(
                menuGroupList.value?.map((item: any) => [item.menuGrpCd, item.menuGrpNm]),
            );
            return columnValue.get(_value) ?? '';
        },
    },
    {
        dataField: 'deptCd',
        // 부서
        headerText: t('com.label.dept'),
        style: 'gridTextAlignLeft',
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
            const columnValue = new Map(
                EAT150.map((item: any) => [item.dtlCommCd, item.dtlCommNm]),
            );
            return columnValue.get(_value) ?? '';
        },
    },
    {
        dataField: 'enterDate',
        // 입사일자
        headerText: t('user.label.joinDate'),
        width: '10%',
        dataType: 'date',
        dateInputFormat: 'yyyymmdd', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd', // 그리드에 보여줄 날짜 형식
    },
    {
        dataField: 'leaveDate',
        // 퇴사일자
        headerText: t('user.label.leaveDate'),
        width: '10%',
        dataType: 'date',
        dateInputFormat: 'yyyymmdd', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd', // 그리드에 보여줄 날짜 형식
    },
];

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

// 조회 버튼
const search = () => {
    myGrid.value.showAjaxLoader();
    selectUserList(searchParameter.value)
        .then((res) => {
            // 그리드 데이터 삽입
            myGrid.value.setGridData(res?.data?.result);
        })
        .catch((e) => {
            popup.alert(e.message);
        })
        .finally(() => {
            myGrid.value.removeAjaxLoader();
        });
};

const doubleClick = (event: any) => {
    popup.closePopup(props.id, event.item);
};

const detailRowClick = () => {
    const grid = myGrid.value;
    const selectedRow = grid.getSelectedRows();
    const userId = selectedRow[0].userId;

    if (grid.getCheckedRowItems().some((row: any) => row.item.userId === userId) === true) {
        grid.addUncheckedRowsByValue('userId', userId); // 클릭 행 체크 해제
    } else {
        grid.addCheckedRowsByValue('userId', userId); // 클릭 행 체크
    }
};

const select = () => {
    const item = myGrid.value.getCheckedRowItemsAll();
    if (item.length === 0) {
        popup.alert(t('com.message.selectItemL', [t('com.label.user')])); // 사용자를 선택해 주세요
    } else {
        popup.closePopup(props.id, item);
    }
};

const reset = () => {
    Object.assign(searchParameter.value, {
        userId: '',
        userNm: '',
        userTypeCd: '',
        menuGrpCd: '',
    });
};
// =====================================================================================================
// HOOK 영역
// =====================================================================================================

onMounted(() => {
    selectMenuGroup()
        .then((res) => {
            menuGroupList.value = res?.data?.result;
        })
        .catch((e) => {
            popup.alert(e.message);
        });

    searchParameter.value = {
        userId: props.param.userId || '',
        userNm: props.param.userNm || '',
        userTypeCd: props.param.userTypeCd || '',
        menuGrpCd: props.param.menuGrpCd || '',
    };
    if (searchParameter.value.userId) {
        search();
    }
});
</script>

<template>
    <div id="main">
        <div id="container" class="popupContent">
            <div class="titleWrap">
                <div class="pageTitle">
                    <!-- 사용자찾기 -->
                    <h2>{{ t('user.label.userFind') }}</h2>
                </div>
                <!-- 메뉴&공통버튼영역 -->
                <div class="btn_area">
                    <!-- 초기화, 조회, 선택 -->
                    <ComButton :text="t('com.label.reset')" @click="reset" />
                    <ComButton :text="t('com.label.search')" @click="search" />
                    <ComButton :text="t('com.select.search')" @click="select" />
                </div>
            </div>

            <!--- S : 검색조건 -->
            <div class="SearchBox popup_search">
                <ul class="SearchInner">
                    <li>
                        <div class="search_container">
                            <!-- 사용자유형 -->
                            <label>{{ t('com.label.userType') }}</label>
                            <ComSelectbox
                                v-if="EAT050 && EAT050.length"
                                v-model="searchParameter.userTypeCd"
                                :select-type="'A'"
                                :options="EAT050"
                            />
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!-- 사용자ID -->
                            <label>{{ t('com.label.userId') }}</label>
                            <span class="search_cell">
                                <ComInputbox
                                    ref="userIdRef"
                                    v-model="searchParameter.userId"
                                    type="text"
                                />
                            </span>
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!-- 사용자명 -->
                            <label>{{ t('com.label.userName') }}</label>
                            <span class="search_cell">
                                <ComInputbox
                                    ref="userNmRef"
                                    v-model="searchParameter.userNm"
                                    type="text"
                                />
                            </span>
                        </div>
                    </li>
                    <li>
                        <div class="search_container">
                            <!-- 메뉴그룹 -->
                            <label>{{ t('menu.label.menuGroup') }}</label>
                            <div class="search_cell">
                                <ComSelectbox
                                    v-if="menuGroupList && menuGroupList.length"
                                    v-model="searchParameter.menuGrpCd"
                                    :select-type="'A'"
                                    :options="menuGroupList"
                                    options-value-key="menuGrpCd"
                                    options-label-key="menuGrpNm"
                                />
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <!--- E : 검색조건 -->

            <!--  S : AUI Grid -->
            <!-- 사용자목록 -->
            <h3>{{ t('user.label.userList') }}</h3>
            <div id="auiGrid">
                <AUIGrid
                    ref="myGrid"
                    :column-layout="columnLayout"
                    :grid-props="gridProps"
                    @cell-double-click="doubleClick"
                    @cell-click="detailRowClick"
                />
            </div>
            <!--  E : AUI Grid -->
        </div>
    </div>
</template>
