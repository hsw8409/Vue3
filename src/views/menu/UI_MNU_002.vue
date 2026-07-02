<script setup lang="ts">
/*
 * @file     UI_MNU_001.vue
 * @menu     메뉴그룹 및 권한부여
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps } from '@/static/AUIGrid/AUIGridDefault';
import { utils } from '@/common/utils';
import { useLayoutStore } from '@/common/stores/layout'; // 레이아웃 store
import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import ComButton from '@/components/form/ComButton.vue';

import { usePopupStore } from '@/common/stores/popup';
import { selectMenuGroup, selectMenuGroupUserProgram, saveMenuGroupProgram } from '@/api/menu'; //backend
import { MenuGroupPropgramProps } from '@/types/menu';

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

const myGrid = ref<any>(null);
const myGridUser = ref<any>(null);
const myGridProgram = ref<any>(null);

const EAT050 = JSON.parse(localStorage.getItem('EAT050') ?? '[]');
const EAT150 = JSON.parse(localStorage.getItem('EAT150') ?? '[]');
const COM010 = JSON.parse(localStorage.getItem('COM010') ?? '[]');
const COM900 = JSON.parse(localStorage.getItem('COM900') ?? '[]');

let clickedRow_grid1 = {}; // 그리드 선택행

const popup = usePopupStore();

// ==================================================
// 그리드 영역
// ==================================================

//그리드 높이 계산
const layoutStore = useLayoutStore();
const gridResizeHeight = layoutStore.layoutHeight - utils.biz.MENU_LAYOUT.ST_G_STM; // 서브타이틀 + 그리드 서브타이틀

// 메뉴그룹정보
const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: 280,
        selectionMode: 'singleRow',
        copySingleCellOnRowMode: true, //선택 로우 말고 선택 셀만 복사
        editable: true,
        editBeginMode: 'doubleClick',
        showRowCheckColumn: false,
        showRowNumColumn: true,
        showStateColumn: true,
        editingOnKeyDown: false,
        // rowIdField: 'menuGrpCd',
        //툴팁 출력 지정
        showTooltip: false,
    })
    .build();

// 사용자정보
const gridPropsUser = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        autoGridHeight: false,
        height: 280,
        selectionMode: 'multipleRows',
        editable: true,
        showRowNumColumn: true,
        showStateColumn: false,
        displayTreeOpen: true,
        // selectionMode: "multipleCells",
        skipReadonlyColumns: true, // 읽기 전용 셀에 대해 키보드 선택이 건너 뛸지 여부
        wrapSelectionMove: true, // 칼럼 끝에서 오른쪽 이동 시 다음 행, 처음 칼럼으로 이동할지 여부
        isColumnOriented: false, // Home, End 키가 칼럼 중심인지 여부
    })
    .build();

// 프로그램정보
const gridPropsProgram = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        autoGridHeight: false,
        height: gridResizeHeight,
        editable: true,
        selectionMode: 'multipleCellls', //선택모드
        useGroupingPanel: false, // 그룹핑 패널 사용
        isColumnOriented: true, // Home, End 키가 칼럼의 시작과 끝으로 이동함.
        showRowNumColumn: true,
        showStateColumn: false,
        showRowCheckColumn: true, // 체크박스 표시 설정
        isRowAllCheckCurrentView: false,
        showRowAllCheckBox: true, //전체 체크박스 표시 설정
        rowIdField: 'pmenuCd', // rowIdField 설정
        enableRowCheckShiftKey: true, // 엑스트라 체크박스에 shiftKey + 클릭으로 다중 선택 할지 여부 (기본값 : false)
    })
    .build();

const columnLayoutMenuGrp = [
    {
        dataField: 'chainCd',
        headerText: t('com.label.chainCode'),
        width: '15%',
        filter: {
            showIcon: true,
            useExMenu: false, // 추가적인 확장 필터 메뉴- 숫자 필터 사용
        },
        editable: false,
    }, // 체인코드
    {
        dataField: 'menuGrpCd',
        headerText: t('menu.label.menuGroupCode'),
        width: '15%',
        filter: {
            showIcon: true,
            useExMenu: false, // 추가적인 확장 필터 메뉴- 숫자 필터 사용
        },
        editable: false,
        headerTooltip: {
            show: false,
            tooltipHtml: t('menu.message.newRowAuto'),
        },
    }, // 메뉴그룹코드
    {
        dataField: 'menuGrpNm',
        headerText: t('menu.label.menuGroupName'),
        style: 'textLeft',
        headerTooltip: { show: false, tooltipHtml: t('menu.message.doubleClickUpdateAble') },
        filter: { showIcon: true, useExMenu: false },
    }, // 메뉴그룹명
    {
        dataField: 'useYn',
        headerText: t('com.label.useYn'),
        width: 100,
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM010,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
    }, // 사용여부
    {
        dataField: 'alPMenuCnt',
        headerText: t('menu.label.menuCnt'),
        width: '10%',
        dataType: 'numeric',
        style: 'textRight',
        formatString: '#,##0',
        editable: false,
    }, // 메뉴건수
    {
        dataField: 'alUserCnt',
        headerText: t('menu.label.userCnt'),
        width: '12%',
        dataType: 'numeric',
        style: 'textRight',
        formatString: '#,##0',
        editable: false,
    }, // 사용자건수
    {
        dataField: 'chainCd',
        headerText: t('com.label.hqCode'),
        filter: {
            showIcon: true,
            useExMenu: false, // 추가적인 확장 필터 메뉴- 숫자 필터 사용
        },
        visible: false,
    }, // 본부코드
];
const columnLayoutUser = [
    { dataField: 'menuGrpCd', headerText: t('menu.label.menuGroupCode'), visible: false }, // 메뉴그룹코드
    {
        dataField: 'menuGrpNm',
        headerText: t('menu.label.menuGroupName'),
        style: 'textLeft',
        editable: false,
        filter: { showIcon: true, useExMenu: false },
    }, // 메뉴그룹명
    {
        dataField: 'userTypeCd',
        headerText: t('com.label.userType'),
        style: 'textLeft',
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            value: string,
            _headerText: string,
            _item: any,
        ) {
            //rowIndex, columnIndex, value, headerText, item
            let columnValue;
            EAT050.forEach(function (code: any) {
                if (code.dtlCommCd == value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    }, // 사용자유형
    {
        dataField: 'deptCd',
        headerText: t('com.label.dept'),
        style: 'textLeft',
        editable: false,
        width: 100,
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            value: string,
            _headerText: string,
            _item: any,
        ) {
            //rowIndex, columnIndex, value, headerText, item
            let columnValue;
            EAT150.forEach(function (code: any) {
                if (code.dtlCommCd == value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    }, // 부서
    {
        dataField: 'userNm',
        headerText: t('com.label.userName'),
        style: 'textLeft',
        editable: false,
        width: 100,
    }, // 사용자명
    { dataField: 'userId', headerText: t('com.label.userId'), style: 'textLeft', editable: false }, // 사용자ID
];
const columnLayoutProgram = [
    {
        dataField: 'pmenuCd',
        headerText: t('menu.label.programMenuCode'),
        disableGrouping: true,
        visible: false,
    }, // 프로그램메뉴코드
    { dataField: 'menuGrpCd', headerText: t('menu.label.menuGroupCode'), visible: false }, // 메뉴그룹코드
    {
        dataField: 'lmenuNm',
        headerText: t('menu.label.menuMainCategoryName'),
        style: 'textLeft',
        editable: false, // cellMerge: true, // 대분류 셀 세로 병합 실행
        filter: { showIcon: true, useExMenu: false },
    }, // 메뉴대분류명
    {
        dataField: 'mmenuNm',
        headerText: t('menu.label.menuMiddleCategoryName'),
        style: 'textLeft',
        editable: false, // cellMerge: true, // 대분류 셀 세로 병합 실행
        filter: { showIcon: true, useExMenu: false },
    }, // 메뉴중분류명
    {
        dataField: 'pmenuNm',
        headerText: t('menu.label.programName'),
        style: 'textLeft',
        editable: false,
        filter: { showIcon: true, useExMenu: false },
    }, // 프로그램명
    {
        dataField: 'sysGbCd',
        headerText: t('user.label.systemFlag'),
        editRenderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'ComboBoxRenderer',
            list: COM900,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            value: string,
            _headerText: string,
            _item: any,
        ) {
            const keyField = this.editRenderer.keyField;
            const valueField = this.editRenderer.valueField;
            const list = this.editRenderer.list;
            const result = list.find((v: any) => v[keyField] === value); // editRenderer 리스트에서 key-value 에 맞는 값 찾아 반환.
            if (result === undefined) return '';
            return result[valueField]; // key 값이 아닌 value 값으로 출력 시키기
        },
        editable: false,
    }, // 시스템구분
    {
        dataField: 'useYn',
        headerText: t('com.label.useYn'),
        width: 100,
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            value: string,
            _headerText: string,
            _item: any,
        ) {
            //rowIndex, columnIndex, value, headerText, item
            let columnValue;
            COM010.forEach(function (code: any) {
                if (code.dtlCommCd == value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
        editable: false,
    }, // 사용여부
];

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

// 초기화 함수
const reset = () => {
    const okCallback = () => {
        if (!myGrid.value || !myGridUser.value || !myGridProgram.value) {
            console.warn('그리드 인스턴스가 아직 초기화되지 않았습니다.');
            return;
        }

        myGrid.value.clearGridData();
        myGridUser.value.clearGridData();
        myGridProgram.value.clearGridData();
        searchMenuGroupInfo();
    };

    // 그리드 변경 여부 체크
    const gridItems = [myGrid.value, myGridProgram.value];
    const result = utils.validator.checkGridChanges(gridItems);

    if (result) {
        // 변경사항이 있습니다. 변경사항이 저장되지 않습니다. 계속하시겠습니까?
        popup.confirm(
            t('com.message.confirmContinue', [t('com.message.changeNotSavedProceed')]),
            undefined,
            {
                onOk: async () => {
                    okCallback();
                },
            },
        );
    } else {
        okCallback();
    }
};

// 선택한 row 셋팅하기
const setClickedRow = (obj?: any) => {
    if (obj) (clickedRow_grid1 as any).item = obj;
};

// 선택한 row 가져오기
const getClickedRow = () => {
    return clickedRow_grid1;
};

// 메뉴그룹정보 조회
const searchMenuGroupInfo = (toSelectRowId?: string) => {
    //메뉴그룹 그리드 조회
    const gridGroup = myGrid.value;
    const gridProgram = myGridProgram.value;
    gridGroup.showAjaxLoader();
    selectMenuGroup()
        .then((res) => {
            // 그리드 데이터 삽입
            gridGroup.setGridData(res.data.result);
            const menuGrpCd =
                toSelectRowId === '-'
                    ? res?.data?.result?.reduce(
                          (prev: any, next: any) =>
                              prev.menuGrpCd > next.menuGrpCd ? prev.menuGrpCd : next.menuGrpCd,
                          { menuGrpCd: 0 },
                      )
                    : toSelectRowId;

            gridGroup.removeAjaxLoader();
            if (toSelectRowId) {
                let toSelectIdx = -1;
                gridGroup
                    .getGridData()
                    .map((v: any, i: any) =>
                        v.menuGrpCd === menuGrpCd ? (toSelectIdx = i) : undefined,
                    );
                gridGroup.setSelectionBlock(toSelectIdx, 1, 1, 1);
                gridGroup.setRowPosition(toSelectIdx - 5);
                gridProgram.removeAjaxLoader();
                return;
            }
            setClickedRow(); //재조회 하는 경우 클릭행 리셋
        })
        .catch(function (e) {
            gridGroup.removeAjaxLoader();
            return e;
        });
};

// 사용여부 컬럼 데이터 변경
const setCheckedRowsByValue = () => {
    const gridProgram = myGridProgram.value;
    gridProgram.setCheckedRowsByValue('useYn', 'Y'); //사용여부  컬럼이 "Y"이면 체크
};

// 메뉴그룹별 프로그램조회 조회
const searchMenuProgram = (obj: any) => {
    const grid = myGrid.value;
    const gridUser = myGridUser.value;
    const gridProgram = myGridProgram.value;

    //신규 추가된 메뉴에 menuGrpCd가 누락된 경우 넣기 위한 변수
    const menuGrpCd = grid.getSelectedRows() ? grid.getSelectedRows()[0].menuGrpCd : undefined;

    // 체인코드가 없으면 프로그램, 사용자 그리드 데이터 초기화
    if (!obj.chainCd) {
        gridProgram.clearGridData();
        gridUser.clearGridData();
        return;
    }
    const params = { menuGrpCd: obj.menuGrpCd, chainCd: obj.chainCd };

    gridUser.showAjaxLoader();
    gridProgram.showAjaxLoader();

    selectMenuGroupUserProgram(params)
        .then((res) => {
            // 그리드 데이터 삽입
            gridUser.setGridData(res?.data?.result?.userDtos);

            gridProgram.setGridData(
                res?.data?.result?.programDtos?.map((v: MenuGroupPropgramProps) => ({
                    ...v,
                    menuGrpCd,
                })),
            );
            gridUser.removeAjaxLoader();
            gridProgram.removeAjaxLoader();

            setCheckedRowsByValue();
        })
        .catch(function (e) {
            gridUser.removeAjaxLoader();
            gridProgram.removeAjaxLoader();
            return e;
        });
};

// 메뉴그룹 변경시 프로그램정보 변경내역이 있는 경우 알림 처리
const fn_selectionChange = (event: any, flag: any) => {
    const gridItems = [myGridProgram.value];
    const result = utils.validator.checkGridChanges(gridItems);

    if (flag != 'uncheck' && result) {
        popup.alert(
            t('com.message.proceedAfterSaveOrReset', [t('com.message.changeNotSavedProceed')]),
        );

        // 1. 타입 단언 추가 (as any 또는 구체적인 타입)
        const clickedRow = getClickedRow() as { item: any };
        const toClickRow = clickedRow.item;

        // 2. 인덱스 찾기 (null 체크 추가 권장)
        if (toClickRow?._$uid && myGrid.value) {
            const idx = myGrid.value.rowIdToIndex(toClickRow._$uid);
            myGrid.value.setSelectionBlock(idx, 1, 1, 1);
        }
        return;
    } else {
        setClickedRow(event.primeCell.item);
        searchMenuProgram(event.primeCell.item);
    }
};

// 저장
const save = async () => {
    const gridGroup = myGrid.value;
    const gridProgram = myGridProgram.value;

    const menuGroupList = utils.validator.getGridSaveData(myGrid.value); //저장할 데이터들 . 메뉴그룹명 입력여부 체크
    const menuGroupDtlList = utils.validator.getGridSaveData(myGridProgram.value); //프로그램 정보
    const saveParams = {
        menuGroupList,
        menuGroupDtlList,
    };

    // 그리드 변경 여부 체크
    const gridItems = [myGrid.value, myGridProgram.value];
    const result = utils.validator.checkGridChanges(gridItems);

    // 저장할 데이터 체크
    if (!result) {
        // 저장할 데이터가 없습니다.
        popup.alert(t('com.message.noDataToSave'));
        return false;
    }

    // 필수 체크
    // 프로그램명, 파일경로, 파일명 체크
    const checkItems = [
        { value: 'menuGrpNm', name: t('menu.label.menuGroupName'), required: true, maxLength: 50 },
    ];

    const isValid = await utils.validator.validateGridData(gridGroup, checkItems, t);
    if (!isValid) {
        return;
    }

    const confirmCallback = () => {
        saveMenuGroupProgram(saveParams) //저장
            .then((_res) => {
                gridProgram.showAjaxLoader();
                // {0}건 처리 되었습니다.
                popup.alert(t('com.message.itemProcessed'));

                gridProgram.setGridData([]);
                searchMenuGroupInfo((getClickedRow() as { item: any }).item.menuGrpCd);

                gridGroup.removeAjaxLoader();
                gridProgram.removeAjaxLoader();
                return;
            })
            .catch((e) => {
                gridGroup.removeAjaxLoader();
                gridProgram.removeAjaxLoader();
                return e;
            });
    };
    // 저장하시겠습니까?
    popup.confirm(t('com.message.confirmSave'), undefined, {
        onOk: async () => {
            confirmCallback();
        },
    });
};

// 메뉴그룹 신규
const newMenuGroup = () => {
    const gridBasic = myGrid.value;
    const gridUser = myGridUser.value;
    const gridProgram = myGridProgram.value;

    // 그리드 변경 여부 체크
    const gridItems = [myGridProgram.value];
    const result = utils.validator.checkGridChanges(gridItems);

    if (result) {
        // 프로그램 정보 수정사항이 있습니다. 저장/초기화 후 진행해주세요.
        popup.alert(
            t('com.message.proceedAfterSaveOrReset', [t('menu.message.programInfoChanged')]),
        );
    }
    const gridBasicObj = {
        menuGrpCd: '-',
        useYn: 'N',
        alPMenuCnt: '0',
        alUserCnt: '0',
    };
    gridBasic.addRow(gridBasicObj, 'last'); //신규행 추가.
    gridProgram.clearGridData();
    gridUser.clearGridData();
};

// 메뉴그룹 삭제
const delMenuGroup = () => {
    // 선택 여부 체크
    const selectedRows = myGrid.value.getSelectedRows();
    if (!selectedRows.length) {
        // 선택된 항목이 없습니다.
        popup.alert(t('com.message.noDataSelected'));
    }

    // 사용자권한이 있는 경우 삭제 불가.
    if (selectedRows[0].alUserCnt) {
        // 속해있는 유저가 있으면 삭제할 수 없습니다.
        popup.alert(t('menu.message.notDeleteWithUsers'));
    }

    myGrid.value.removeRow(myGrid.value.getSelectedRows()[0].rowIndx);
    myGrid.value
        .getGridData()
        .map((v: any, i: any) =>
            v.menuGrpCd === selectedRows[0].menuGrpCd ? myGrid.value.removeRow(i) : undefined,
        );
};

// 프로그램 체크박스 전체 선택시 사용여부 일괄 변경
const rowAllCheckClick = (event: any) => {
    const gridProgram = myGridProgram.value;
    const programList = gridProgram.getGridData();

    // forEach를 사용하여 index(i)와 item(program)을 동시에 가져옴
    programList.forEach((program: any, i: number) => {
        program.useYn = event.checked ? 'Y' : 'N';
        gridProgram.updateRows(program, i);
    });
};

// 프로그램 셀 선택시 사용여부 변경
const toggleUseYn = (event: any) => {
    //단일 셀 선택 시
    const gridProgram = myGridProgram.value;
    const item = event.item;
    item.useYn = item.useYn == 'Y' ? 'N' : 'Y'; // Y값은 N으로 변경 업데이트 하고
    gridProgram.updateRows(item, event.rowIndex); //그리드에 반영

    setCheckedRowsByValue();
};

// 그리드 선택시 사용여부 변경
const changeUseYn = (event: any) => {
    //셀 클릭 시
    const grid = myGridProgram.value;
    const selectedRow = event.selectedItems;

    if (selectedRow?.length > 1) {
        // 사용여부 변경 처리
        for (const sRow of selectedRow) {
            sRow.item.useYn = 'Y';
            grid.updateRows(sRow.item, sRow.rowIndex);
        }
    }
    setCheckedRowsByValue();
};

// 업데이트하기
const updateRows = (event: any) => {
    const grid = myGridProgram.value;
    event.item.useYn = event.checked && !event.shiftKey ? 'Y' : 'N';
    grid.updateRows(event.item, event.rowIndex);

    if (event.checked && event.shiftKey) {
        const checkedItems = grid.getCheckedRowItems();

        // 1. 상태 업데이트
        checkedItems.forEach((v: any) => (v.item.useYn = 'Y'));

        // 2. for...of를 사용하여 실제 객체(v)에 직접 접근
        for (const v of checkedItems) {
            const item = v.item;
            const rowIndex = v.rowIndex;
            grid.updateRows(item, rowIndex);
        }
    }
    setCheckedRowsByValue();
};

// 그리드 데이터 변경시
const fn_cellEditEnd = (event: any, gridName: any) => {
    const gridGroup = myGrid.value;
    if (gridName === gridGroup) {
        //그룹그리드를 편집하는 경우
        if (event.dataField === 'useYn') {
            //사용여부
            if (event.value === 'N' && event.item.alUserCnt > 0) {
                //미사용으로 변경하는 경우, 사용자가 있으면
                gridGroup.updateRow({ ...event.item, useYn: event.oldValue }, event.rowIndex); //기본값 원래값으로 되돌림
                // 사용자가 있는 경우 미사용으로 변경할 수 없습니다.
                popup.alert(t('menu.message.notUpdateWithUsers'));
            }
        }
    }
};

// ==================================================
// Hook 영역
// ==================================================

onMounted(() => {
    myGrid.value.clearGridData();
    myGridUser.value.clearGridData();
    myGridProgram.value.clearGridData();
    //페이지 로딩 시
    searchMenuGroupInfo();
});
</script>

<template>
    <!-- 초기화, 저장 -->
    <MenuTop :menu-info="$props.menuInfo" :methods="{ reset, save: () => save() }" />
    <MenuContent>
        <div class="halfDiv">
            <div>
                <div class="subTitle">
                    <!-- 메뉴그룹정보 -->
                    <h3>
                        {{ t('menu.label.menuGroupInfo') }}
                    </h3>
                    <div class="subBtnWrap">
                        <!-- 신규 -->
                        <ComButton :text="t('com.label.new')" @click="newMenuGroup" />
                        <!-- 삭제 -->
                        <ComButton :text="t('com.label.del')" @click="delMenuGroup" />
                    </div>
                </div>
                <!--  S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGrid"
                        :column-layout="columnLayoutMenuGrp"
                        :grid-props="gridProps"
                        @selection-change="fn_selectionChange"
                        @cell-edit-end="fn_cellEditEnd($event, myGrid)"
                    />
                </div>
                <!--  E : AUI Grid -->
            </div>

            <div>
                <div class="subTitle">
                    <!-- 사용자정보 -->
                    <h3>{{ t('menu.label.userInfo') }}</h3>
                </div>
                <!-- S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGridUser"
                        :column-layout="columnLayoutUser"
                        :grid-props="gridPropsUser"
                    />
                </div>
                <!--  E : AUI Grid -->
            </div>
        </div>
        <div>
            <div class="subTitle">
                <!-- 프로그램정보 -->
                <h3>{{ t('menu.label.programInfo') }}</h3>
            </div>
            <!--  S : AUI Grid -->
            <div id="auiGrid">
                <AUIGrid
                    ref="myGridProgram"
                    :column-layout="columnLayoutProgram"
                    :grid-props="gridPropsProgram"
                    @cell-click="toggleUseYn"
                    @selection-change="changeUseYn"
                    @row-check-click="updateRows"
                    @row-all-chk-click="rowAllCheckClick"
                />
                <!--  -->
            </div>
            <!--  E : AUI Grid -->
        </div>
    </MenuContent>
</template>

<style scoped>
.textLeft {
    text-align: left;
}

.textRight {
    text-align: right;
    /* cursor: pointer; */
}
</style>
