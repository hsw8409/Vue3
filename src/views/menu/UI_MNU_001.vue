<script setup lang="ts">
/*
 * @file     UI_MNU_001.vue
 * @menu     메뉴분류관리
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

import { useLayoutStore } from '@/common/stores/layout'; // 레이아웃 store
import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import ComButton from '@/components/form/ComButton.vue';
import { utils } from '@/common/utils';
import { usePopupStore } from '@/common/stores/popup';

import {
    selectLmenuList,
    selectMmenuList,
    selectPmenuList,
    saveLmenu,
    saveMmenu,
    savePmenu,
} from '@/api/menu'; //backend

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

const myGrid1 = ref<any>(null);
const myGrid2 = ref<any>(null);
const myGrid3 = ref<any>(null);
const savelmenuCd = ref('');
const savemmenuCd = ref('');

const COM010 = JSON.parse(localStorage.getItem('COM010') ?? '[]');
const COM900 = JSON.parse(localStorage.getItem('COM900') ?? '[]');
const menuTopRef = ref(null); // 메뉴 공통 버튼

const popup = usePopupStore();

// ==================================================
// 그리드 영역
// ==================================================

//그리드 높이 계산
const layoutStore = useLayoutStore();
const gridResizeHeight = ref(layoutStore.layoutHeight - utils.biz.MENU_LAYOUT.ST); // 💡 ref로 감싸 동적 변경 대응

// 그리드 속성 정의 (computed 구조를 쓰지 않으므로 생성용 factory 함수화 혹은 반응형 주입 필요)
const gridProps: GridProps = ref(
    AUIGridDefault.gridPropsBuilder()
        .withEditable(true)
        .withExtraProps({
            showRowNumColumn: false,
            showStateColumn: true,
            height: gridResizeHeight.value,
        })
        .build(),
);

// 대분류 그리드 레이아웃
const columnLayout1 = [
    {
        dataField: 'lmenuCd',
        headerText: `${t('menu.label.mainCategory')}<br/>${t('com.label.code')}`,
        editable: false,
        width: 70,
    }, // 대분류<br/>코드
    {
        dataField: 'lmenuNm',
        headerText: t('menu.label.mainCategoryName'),
        style: 'gridTextAlignLeft',
        editRenderer: {
            type: 'InputEditRenderer',
            maxlength: 33,
        },
    }, // 대분류명
    {
        dataField: 'dispSortNo',
        headerText: t('com.label.seq'),
        style: 'gridTextAlignRight',
        width: 50,
        editRenderer: {
            type: 'Number',
            onlyNumeric: true, // 0~9만 입력가능
            maxlength: 4,
            textAlign: 'right', // 오른쪽 정렬로 입력되도록 설정
            autoThousandSeparator: false, // 천단위 구분자 삽입 여부
        },
    }, // 순서
    {
        dataField: 'sysGbCd',
        headerText: t('user.label.systemFlag'),
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM900,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommCd',
        },
        width: 80,
    }, // 시스템구분
    {
        dataField: 'useYn',
        headerText: `${t('com.label.use')}<br/>${t('com.label.yn')}`,
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM010,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
        width: 80,
    }, // 사용<br/>여부
];

// 중분류 그리드 레이아웃
const columnLayout2 = [
    {
        dataField: 'mmenuCd',
        headerText: `${t('menu.label.middleCategory')}<br/>${t('com.label.code')}`,
        editable: false,
        width: 70,
    }, // 중분류<br/>코드
    {
        dataField: 'mmenuNm',
        headerText: t('menu.label.middleCategoryName'),
        style: 'gridTextAlignLeft',
        editRenderer: {
            type: 'InputEditRenderer',
            maxlength: 33,
        },
    }, // 중분류명
    {
        dataField: 'dispSortNo',
        headerText: t('com.label.seq'),
        style: 'gridTextAlignRight',
        width: 50,
        editRenderer: {
            type: 'Number',
            onlyNumeric: true, // 0~9만 입력가능
            maxlength: 4,
            textAlign: 'right', // 오른쪽 정렬로 입력되도록 설정
            autoThousandSeparator: false, // 천단위 구분자 삽입 여부
        },
    }, // 순서
    {
        dataField: 'useYn',
        headerText: `${t('com.label.use')}<br/>${t('com.label.yn')}`,
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM010,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
        width: 80,
    }, // 사용<br/>여부
];

// 프로그램 그리드 레이아웃
const columnLayout3 = [
    { dataField: 'pmenuCd', headerText: t('menu.label.programCode'), width: 100, editable: false }, // 프로그램코드
    {
        dataField: 'pmenuNm',
        headerText: t('menu.label.programName'),
        style: 'gridTextAlignLeft',
        width: 200,
        editRenderer: {
            type: 'InputEditRenderer',
            maxlength: 33,
        },
    }, // 프로그램명
    {
        dataField: 'filePath',
        headerText: t('menu.label.filePath'),
        editRenderer: {
            type: 'InputEditRenderer',
            maxlength: 1000,
        },
    }, // 파일 경로
    {
        dataField: 'fileNm',
        headerText: t('menu.label.fileName'),
        width: 120,
        editRenderer: {
            type: 'InputEditRenderer',
            maxlength: 66,
        },
    }, // 파일 명
    {
        dataField: 'dispSortNo',
        headerText: t('com.label.seq'),
        style: 'gridTextAlignRight',
        width: 40,
        editRenderer: {
            type: 'Number',
            onlyNumeric: true, // 0~9만 입력가능
            maxlength: 4,
            textAlign: 'right', // 오른쪽 정렬로 입력되도록 설정
            autoThousandSeparator: false, // 천단위 구분자 삽입 여부
        },
    }, // 순서
    {
        dataField: 'useYn',
        headerText: `${t('com.label.use')}<br/>${t('com.label.yn')}`,
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM010,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
        width: 80,
    }, // 사용<br/>여부
];

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

// 초기화 함수
const reset = () => {
    const okCallback = () => {
        myGrid1.value.clearGridData();
        myGrid2.value.clearGridData();
        myGrid3.value.clearGridData();
        searchMainCategory();
    };

    // 그리드 변경 여부 체크
    const gridItems = [myGrid1.value, myGrid2.value, myGrid3.value];
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

// 대분류목록 조회
const searchMainCategory = () => {
    const grid = myGrid1.value;
    grid.showAjaxLoader();

    // 대분류목록 조회
    selectLmenuList()
        .then((res) => {
            grid.setGridData(res?.data?.result);
            grid.removeAjaxLoader();
        })
        .catch((e) => {
            popup.alert(e.message);
            grid.removeAjaxLoader();
        });
};

// 중분류목록 조회
const searchMiddleCategory = () => {
    myGrid3.value.clearGridData();
    const grid1 = myGrid1.value;
    const grid2 = myGrid2.value;

    if (!grid1.getSelectedRows()[0]) return; // 선택 행 확인 안전장치
    grid2.showAjaxLoader();

    // 대분류코드
    savelmenuCd.value = grid1.getSelectedRows()[0].lmenuCd;

    // 중분류목록 조회
    selectMmenuList({ lmenuCd: grid1.getSelectedRows()[0].lmenuCd })
        .then((res) => {
            // 그리드 데이터 삽입
            grid2.setGridData(res?.data?.result);
            grid2.removeAjaxLoader();
        })
        .catch((e) => {
            popup.alert(e.message);
            grid2.removeAjaxLoader();
        });
};

// 프로그램 조회
const searchProgram = () => {
    const grid2 = myGrid2.value;
    const grid3 = myGrid3.value;

    if (!grid2.getSelectedRows()[0]) return; // 선택 행 확인 안전장치
    grid3.showAjaxLoader();

    // 중분류 코드
    savemmenuCd.value = grid2.getSelectedRows()[0].mmenuCd;

    // 프로그램목록 조회
    selectPmenuList({ mmenuCd: grid2.getSelectedRows()[0].mmenuCd })
        .then((res) => {
            // 그리드 데이터 삽입
            grid3.setGridData(res?.data?.result);
            grid3.removeAjaxLoader();
        })
        .catch((e) => {
            popup.alert(e.message);
            grid3.removeAjaxLoader();
        });
};

// 대분류 신규
const newMainCategory = () => {
    const grid = myGrid1.value;

    // 신규로 추가된 행이 있는지 체크.
    if (utils.validator.checkAddedRowItems(grid)) {
        // 신규 행은 하나만 등록 가능합니다.
        popup.alert(t('com.message.allowOnlyOneNewRow'));
        return false;
    }
    /* 그리드에 추가될 row 데이터 */
    const obj = {
        lmenuCd: '',
        lmenuNm: '',
        useYn: 'Y',
    };
    grid.addRow(obj, 'first');
    grid.setSelectionByIndex(0, 1); //대분류코드는 입력불가, 대분류명을 바로 입력할 수 있게 selection 걸음
    grid.openInputer();
    myGrid2.value.clearGridData();
    myGrid3.value.clearGridData();
};

// 대분류 저장
const saveMainCategory = async () => {
    const grid = myGrid1.value;

    const gridItems = [grid];
    const result = utils.validator.checkGridChanges(gridItems);

    // 저장할 데이터 체크
    if (!result) {
        // 저장할 데이터가 없습니다.
        popup.alert(t('com.message.noDataToSave'));
        return false;
    }

    // 필수 체크
    // 대분류명 체크
    const checkItems = [
        { value: 'lmenuNm', name: t('menu.label.mainCategoryName'), required: true, maxLength: 33 },
    ];

    const isValid = await utils.validator.validateGridData(grid, checkItems, t);
    if (!isValid) {
        return;
    }

    // 변경된 데이터 가져오기
    const mainCategoryData = utils.validator.getGridSaveData(grid);

    popup.confirm(t('com.message.confirmSave'), undefined, {
        onOk: async () => {
            saveLmenu(mainCategoryData)
                .then((res: any) => {
                    popup.alert(t('com.message.itemProcessed', [res?.result]));
                    searchMainCategory();
                    myGrid2.value?.clearGridData();
                })
                .catch((e) => {
                    popup.alert(e?.message || String(e));
                    grid.removeAjaxLoader();
                });
        },
    });
};

// 중분류 신규
const newMiddleCategory = () => {
    const grid1 = myGrid1.value; // 대분류
    const grid2 = myGrid2.value; // 중분류

    // 대분류 선택여부 체크
    if (utils.validator.checkIsNull(grid1.getSelectedItems())) {
        // 대분류 선택 후 작업을 진행하여 주세요.
        popup.alert(t('com.message.proceedAfterSelect', [t('menu.label.mainCategory')]));
        return false;
    }
    if (utils.validator.checkIsNull(grid1.getSelectedItems()[0].item.lmenuCd)) {
        // 대분류 저장 후 작업을 진행하여 주세요.
        popup.alert(t('com.message.proceedAfterSave', [t('menu.label.mainCategory')]));
        return false;
    }

    // 신규로 추가된 행이 있는지 체크.
    if (utils.validator.checkAddedRowItems(grid2)) {
        // 신규 행은 하나만 등록 가능합니다.
        popup.alert(t('com.message.allowOnlyOneNewRow'));
        return false;
    }

    /* 그리드에 추가될 row 데이터 */
    const obj = {
        mmenuCd: '',
        mmenuNm: '',
        lmenuCd: savelmenuCd.value,
        useYn: 'Y',
    };
    grid2.addRow(obj, 'first');
    grid2.setSelectionByIndex(0, 1); //대분류코드는 입력불가, 대분류명을 바로 입력할 수 있게 selection 걸음
    grid2.openInputer();
    myGrid3.value.clearGridData();
};

// 중분류 저장
const saveMiddleCategory = async () => {
    const grid1 = myGrid1.value; // 대분류
    const grid2 = myGrid2.value; // 중분류

    // 대분류 선택여부 체크
    if (utils.validator.checkIsNull(grid1.getSelectedItems())) {
        // 대분류 선택 후 작업을 진행하여 주세요.
        popup.alert(t('com.message.proceedAfterSelect', [t('menu.label.mainCategory')]));
        return false;
    }

    const gridItems = [grid2];
    const result = utils.validator.checkGridChanges(gridItems);

    // 저장할 데이터 체크
    if (!result) {
        // 저장할 데이터가 없습니다.
        popup.alert(t('com.message.noDataToSave'));
        return false;
    }

    // 필수 체크
    // 중분류명 체크
    const checkItems = [
        {
            value: 'mmenuNm',
            name: t('menu.label.middleCategoryName'),
            required: true,
            maxLength: 33,
        },
    ];

    const isValid = await utils.validator.validateGridData(grid2, checkItems, t);
    if (!isValid) {
        return;
    }

    // 변경된 데이터 가져오기
    const middleCategoryData = utils.validator.getGridSaveData(grid2);

    popup.confirm(t('com.message.confirmSave'), undefined, {
        onOk: async () => {
            saveMmenu(middleCategoryData)
                .then((res: any) => {
                    popup.alert(t('com.message.itemProcessed', [res?.result]));
                    searchMainCategory();
                    myGrid3.value?.clearGridData();
                })
                .catch((e) => {
                    popup.alert(e?.message || String(e));
                    grid2.removeAjaxLoader();
                });
        },
    });
};

// 프로그램 신규
const newProgram = () => {
    const grid2 = myGrid2.value;
    const grid3 = myGrid3.value;

    // 중분류 선택여부 체크
    if (utils.validator.checkIsNull(grid2.getSelectedItems())) {
        // 중분류 선택 후 작업을 진행하여 주세요.
        popup.alert(t('com.message.proceedAfterSelect', [t('menu.label.middleCategory')]));
        return false;
    }

    // 중분류 저장 여부
    if (utils.validator.checkIsNull(grid2.getSelectedItems()[0].item.mmenuCd)) {
        // 중분류 저장 후 작업을 진행하여 주세요.
        popup.alert(t('com.message.proceedAfterSave', [t('menu.label.middleCategory')]));
        return false;
    }

    // 신규로 추가된 행이 있는지 체크.
    if (utils.validator.checkAddedRowItems(grid3)) {
        // 신규 행은 하나만 등록 가능합니다.
        popup.alert(t('com.message.allowOnlyOneNewRow'));
        return false;
    }

    const obj = {
        pmenuCd: '',
        pmenuNm: '',
        filePath: '',
        fileNm: '',
        useYn: 'Y',
        mmenuCd: savemmenuCd.value,
        lmenuCd: savelmenuCd.value,
    };
    grid3.addRow(obj, 'first');
    grid3.setSelectionByIndex(0, 1); //대분류코드는 입력불가, 대분류명을 바로 입력할 수 있게 selection 걸음
    grid3.openInputer();
};

// 프로그램 저장
const saveProgram = async () => {
    const grid2 = myGrid2.value; // 중분류
    const grid3 = myGrid3.value; // 프로그램목록

    const gridItems = [grid3];
    const result = utils.validator.checkGridChanges(gridItems);

    // 저장할 데이터 체크
    if (!result) {
        // 저장할 데이터가 없습니다.
        popup.alert(t('com.message.noDataToSave'));
        return false;
    }

    // 중분류 선택여부 체크
    if (utils.validator.checkIsNull(grid2.getSelectedItems())) {
        // 중분류 선택 후 작업을 진행하여 주세요.
        popup.alert(t('com.message.proceedAfterSelect', [t('menu.label.middleCategory')]));
        return false;
    }

    // 변경된 데이터 가져오기
    const programData = utils.validator.getGridSaveData(grid3);

    // 필수 체크
    // 프로그램명, 파일경로, 파일명 체크
    const checkItems = [
        { value: 'pmenuNm', name: t('menu.label.programName'), required: true, maxLength: 33 },
        { value: 'filePath', name: t('menu.label.filePath'), required: true, maxLength: 1000 },
        { value: 'fileNm', name: t('menu.label.fileName'), required: true, maxLength: 60 },
    ];

    const isValid = await utils.validator.validateGridData(grid3, checkItems, t);
    if (!isValid) {
        return;
    }

    popup.confirm(t('com.message.confirmSave'), undefined, {
        onOk: async () => {
            savePmenu(programData)
                .then((res: any) => {
                    popup.alert(t('com.message.itemProcessed', [res?.data?.result]));
                    searchProgram();
                })
                .catch((e) => {
                    popup.alert(e?.message || String(e));
                    grid3.removeAjaxLoader();
                });
        },
    });
};

// validation 체크
const lengthValidation = (event: any) => {
    // 코드 길이 체크
    if (event.columnIndex === 1) {
        if (utils.stringUtil.getByteB(event.value) > 100) {
            // "입력한 값이 너무 깁니다.
            popup.alert(t('com.message.messageTooLong'));
            return event.oldValue;
        }
    }
    // 파일경로 길이 체크
    if (event.columnIndex === 2 && event.headerText == t('menu.label.filePath')) {
        if (utils.stringUtil.getByteB(event.value) > 1000) {
            // 입력한 값이 너무 깁니다.
            popup.alert(t('com.message.messageTooLong'));
            return event.oldValue;
        }
    }
    // 파일명 길이 체크
    if (event.columnIndex === 3 && event.headerText == t('menu.label.fileName')) {
        if (utils.stringUtil.getByteB(event.value) > 200) {
            // 입력한 값이 너무 깁니다.
            popup.alert(t('com.message.messageTooLong'));
            return event.oldValue;
        }
    }
};

// ==================================================
// Hook 영역
// ==================================================

onMounted(() => {
    myGrid1.value.clearGridData();
    myGrid2.value.clearGridData();
    myGrid3.value.clearGridData();

    // 화면이 로드된 이후 실행
    searchMainCategory();
});
</script>

<template>
    <MenuTop ref="menuTopRef" :menu-info="$props.menuInfo" :methods="{ reset }" />

    <MenuContent>
        <div class="thirdDiv2">
            <div>
                <div class="subTitle">
                    <h3>{{ t('menu.label.mainCategoryInfo') }}</h3>
                    <div class="subBtnWrap">
                        <ComButton
                            :params="{ name: t('com.label.new') }"
                            @click="newMainCategory"
                        />
                        <ComButton
                            :params="{ name: t('com.label.save') }"
                            @click="saveMainCategory"
                        />
                    </div>
                </div>
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGrid1"
                        :column-layout="columnLayout1"
                        :grid-props="gridProps"
                        width="100%"
                        height="100%"
                        @selection-change="searchMiddleCategory()"
                        @cell-edit-end-before="lengthValidation"
                    />
                </div>
            </div>

            <div>
                <div class="subTitle">
                    <h3>{{ t('menu.label.middleCategoryInfo') }}</h3>
                    <div class="subBtnWrap">
                        <ComButton
                            :params="{ name: t('com.label.new') }"
                            @click="newMiddleCategory"
                        />
                        <ComButton
                            :params="{ name: t('com.label.save') }"
                            @click="saveMiddleCategory"
                        />
                    </div>
                </div>
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGrid2"
                        :column-layout="columnLayout2"
                        :grid-props="gridProps"
                        width="100%"
                        height="100%"
                        @selection-change="searchProgram()"
                        @cell-edit-end-before="lengthValidation"
                    />
                </div>
            </div>
            <div>
                <div class="subTitle">
                    <h3>{{ t('menu.label.programInfo') }}</h3>
                    <div class="subBtnWrap">
                        <ComButton :params="{ name: t('com.label.new') }" @click="newProgram" />
                        <ComButton :params="{ name: t('com.label.save') }" @click="saveProgram" />
                    </div>
                </div>
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGrid3"
                        :column-layout="columnLayout3"
                        :grid-props="gridProps"
                        width="100%"
                        height="100%"
                        @cell-edit-end-before="lengthValidation"
                    />
                </div>
            </div>
        </div>
    </MenuContent>
</template>

<style scoped>
.leftAlign {
    text-align: left !important;
}
.rightAlign {
    text-align: right !important;
}
</style>
