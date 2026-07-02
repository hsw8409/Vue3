<script setup lang="ts">
/*
 * @file     UI_ITM_001.vue
 * @menu     품목분류관리
 * @author   astems
 * @since    2026-06-29
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted } from 'vue';
import TokenService from '@/common/service/token';
import { useI18n } from 'vue-i18n';

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps } from '@/static/AUIGrid/AUIGridDefault';

import { useLayoutStore } from '@/common/stores/layout'; // 레이아웃 store
import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import ComButton from '@/components/form/ComButton.vue';
import { utils } from '@/common/utils';
import { usePopupStore } from '@/common/stores/popup';

// api
import {
    selectItemListL,
    selectItemListM,
    selectItemListS,
    saveItemL,
    saveItemM,
    saveItemS,
} from '@/api/item'; //backend

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

const lGrid = ref<any>(null);
const mGrid = ref<any>(null);
const sGrid = ref<any>(null);
const grid = ref<any>(null);

// 신규나 저장 버튼을 위한 flag 값 (false : 조회 전, true : 조회 후)
const mitemFg = ref(false);
const sitemFg = ref(false);

// 그리드 사용여부 드롭다운 리스트 생성
const EAT570 = JSON.parse(localStorage.getItem('EAT570') ?? '[]');
const EAT571 = JSON.parse(localStorage.getItem('EAT571') ?? '[]');
const COM010 = JSON.parse(localStorage.getItem('COM010') ?? '[]');
const menuTopRef = ref(null); // 메뉴 공통 버튼

const lsaveCd = ref('');
const msaveCd = ref('');
const loginUser = TokenService.getUser(); // 현재 로그인한 유저

const popup = usePopupStore();

const validationCheck = ref(true);
const reSelectCd = ref('');

// =====================================================================================================
// 그리드 영역
// =====================================================================================================

// 그리드 높이 계산
const layoutStore = useLayoutStore();
const gridResizeHeight = layoutStore.layoutHeight - utils.biz.MENU_LAYOUT.ST;

// 그리드 속성 정의
const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withEditable(true)
    .withExtraProps({
        showRowNumColumn: false,
        showRowCheckColumn: true,
        showRowAllCheckBox: false,
        showStateColumn: false,
        height: gridResizeHeight,
    })
    .build();

// 대분류 그리드 레이아웃
const lcolumnLayout = [
    { dataField: 'lclsItemCd', headerText: t('item.label.lclsCode'), editable: false }, // 대분류코드
    {
        dataField: 'lclsItemNm',
        headerText: t('menu.label.mainCategoryName'),
        style: 'gridTextAlignLeft',
        width: '30%',
    }, // 대분류명
    {
        dataField: 'lclsGbnCd',
        headerText: t('item.label.lclsFlag'), // 대분류구분
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: EAT570,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
    },
    {
        dataField: 'orderBySeq',
        headerText: t('com.label.sortSeq'), // 정렬순서
        style: 'gridTextAlignRight',
        editRenderer: {
            type: 'InputEditRenderer',
            onlyNumeric: true, // 0~9만 입력가능
            allowPoint: false, // 소수점( . ) 도 허용할지 여부
            allowNegative: false, // 마이너스 부호(-) 허용 여부
        },
    },
    {
        dataField: 'useYn',
        headerText: t('com.label.useYn'), // 사용여부
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM010,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
    },
];
// 중분류 그리드 레이아웃
const mcolumnLayout = [
    { dataField: 'mclsItemCd', headerText: t('item.label.mclsCode'), editable: false }, // 중분류코드
    {
        dataField: 'mclsItemNm',
        headerText: t('menu.label.middleCategoryName'),
        style: 'gridTextAlignLeft',
        width: '30%',
    }, // 중분류명
    {
        dataField: 'mclsGbnCd',
        headerText: t('item.label.mclsFlag'), // 중분류구분
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: EAT571,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
    },
    {
        dataField: 'orderBySeq',
        headerText: t('com.label.sortSeq'), // 정렬순서
        style: 'gridTextAlignRight',
        editRenderer: {
            type: 'InputEditRenderer',
            onlyNumeric: true, // 0~9만 입력가능
            allowPoint: false, // 소수점( . ) 도 허용할지 여부
            allowNegative: false, // 마이너스 부호(-) 허용 여부
        },
    },
    {
        dataField: 'useYn',
        headerText: t('com.label.useYn'), // 사용여부
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM010,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
    },
];
// 소분류 그리드 레이아웃
const scolumnLayout = [
    {
        dataField: 'sclsItemCd',
        headerText: t('item.label.sclsCode'),
        editable: false,
        width: '22%',
    }, // 소분류코드
    {
        dataField: 'sclsItemNm',
        headerText: t('item.label.sclsName'),
        style: 'gridTextAlignLeft',
        width: '40%',
    }, // 소분류명
    {
        dataField: 'orderBySeq',
        headerText: t('com.label.sortSeq'), // 정렬순서
        style: 'gridTextAlignRight',
        editRenderer: {
            type: 'InputEditRenderer',
            onlyNumeric: true, // 0~9만 입력가능
            allowPoint: false, // 소수점( . ) 도 허용할지 여부
            allowNegative: false, // 마이너스 부호(-) 허용 여부
        },
    },
    {
        dataField: 'useYn',
        headerText: t('com.label.useYn'), // 사용여부
        width: '20%',
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM010,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
        },
    },
];

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

// 그리드 조회 (해당 그리드, parameter로 보낼 값)
const search = async (i: 'L' | 'M' | 'S', f: any) => {
    console.info('>>>>>', i);
    // 1. Define configuration for each type
    const config = {
        L: {
            grid: lGrid,
            fn: selectItemListL,
            params: {},
        },
        M: {
            grid: mGrid,
            fn: selectItemListM,
            params: { lclsItemCd: f },
            onSuccess: () => {
                console.info('여기실행..');
                mitemFg.value = true;
            },
        },
        S: {
            grid: sGrid,
            fn: selectItemListS,
            params: { mclsItemCd: f },
            onSuccess: () => {
                sitemFg.value = true;
            },
        },
    };

    const target = config[i];
    if (!target) return;

    // 2. Set the current grid reference
    grid.value = target.grid.value;

    try {
        grid.value.showAjaxLoader();

        const res = await target.fn(target.params);
        grid.value.setGridData(res?.data?.result);
        (target as any).onSuccess?.();
    } catch (e: any) {
        popup.alert(e.message);
    } finally {
        grid.value.removeAjaxLoader();
    }
};

//
// 초기화 버튼
const reset = () => {
    search('L', null);
    mGrid.value.clearGridData();
    sGrid.value.clearGridData();
    lsaveCd.value = '';
    msaveCd.value = '';
};

//
// 신규 버튼
// 대분류 신규버튼
const lNew = () => {
    const grid = lGrid.value; // 대분류 그리드 연결

    const seqArray = grid.getColumnValues('orderBySeq').map(Number); // PG코드의 배열을 Int타입으로 가져옴
    let seq;
    if (seqArray.length == 0) {
        seq = 1;
    } else {
        seq = Math.max(...seqArray); // 최대값 계산
        seq += 1; // 소분류 코드는 1씩 증가
    }
    /* 그리드에 추가될 row 데이터 */
    const obj = {
        lclsItemCd: '',
        lclsItemNm: '',
        lclsGbnCd: '',
        orderBySeq: seq,
        useYn: 'Y',
        check: 'Y',
    };
    grid.addRow(obj, 'first');
    grid.setAllCheckedRows(false); //모든 선택을 해제
    grid.setSelectionByIndex(0, 1); //대분류코드는 입력불가, 대분류명을 바로 입력할 수 있게 selection 걸음
    grid.openInputer();
    mGrid.value.clearGridData();
    sGrid.value.clearGridData();
    lsaveCd.value = '';
    grid.addCheckedRowsByValue('check', 'Y');
};

// 중분류 신규버튼
const mnew = () => {
    if (lsaveCd.value != '') {
        const grid = mGrid.value; // 중분류 그리드 연결

        const seqArray = grid.getColumnValues('orderBySeq').map(Number); // PG코드의 배열을 Int타입으로 가져옴
        let seq;
        if (seqArray.length == 0) {
            seq = 1;
        } else {
            seq = Math.max(...seqArray); // 최대값 계산
            seq += 1; // 소분류 코드는 1씩 증가
        }
        /* 그리드에 추가될 row 데이터 */
        const obj = {
            mclsItemCd: '',
            mclsItemNm: '',
            orderBySeq: seq,
            mclsGbnCd: '',
            useYn: 'Y',
            lclsItemCd: lsaveCd.value,
            check: 'Y',
        };
        grid.addRow(obj, 'first');
        grid.setAllCheckedRows(false); //모든 선택을 해제
        grid.setSelectionByIndex(0, 1); //대분류코드는 입력불가, 대분류명을 바로 입력할 수 있게 selection 걸음
        grid.openInputer();
        sGrid.value.clearGridData();
        msaveCd.value = '';
        grid.addCheckedRowsByValue('check', 'Y');
    } else {
        // 조회 후 작업을 진행하여 주세요
        popup.alert(t('com.message.proceedAfterSearch'));
        return false;
    }
};
// 소분류 신규버튼
const snew = () => {
    if (msaveCd.value != '') {
        const grid = sGrid.value; // 소분류 그리드 연결
        const seqArray = grid.getColumnValues('orderBySeq').map(Number); // PG코드의 배열을 Int타입으로 가져옴
        let seq;
        if (seqArray.length == 0) {
            seq = 1;
        } else {
            seq = Math.max(...seqArray); // 최대값 계산
            seq += 1; // 소분류 코드는 1씩 증가
        }
        /* 그리드에 추가될 row 데이터 */
        const obj = {
            sclsItemCd: '',
            sclsItemNm: '',
            orderBySeq: seq,
            useYn: 'Y',
            lclsItemCd: lsaveCd.value,
            mclsItemCd: msaveCd.value,
            check: 'Y',
        };
        grid.addRow(obj, 'first');
        grid.setAllCheckedRows(false); //모든 선택을 해제
        grid.setSelectionByIndex(0, 1); //대분류코드는 입력불가, 대분류명을 바로 입력할 수 있게 selection 걸음
        grid.openInputer(); //소분류명 입력창 바로열기
        grid.addCheckedRowsByValue('check', 'Y');
    } else {
        // 조회 후 작업을 진행하여 주세요.
        popup.alert(t('com.message.proceedAfterSearch'));
        return false;
    }
};

//
//저장 버튼
const save = async (i: any) => {
    console.info('mitemFg.value>>>', mitemFg.value);
    const userId = loginUser.userId;
    if (i == 'L') {
        grid.value = lGrid.value;
    } else if (i == 'M') {
        if (mitemFg.value == true) {
            grid.value = mGrid.value;
            reSelectCd.value = lsaveCd.value;
        } else {
            // 조회 후 작업을 진행하여 주세요.
            popup.alert(t('com.message.proceedAfterSearch'));
            return false;
        }
    } else if (i == 'S') {
        if (sitemFg.value == true) {
            grid.value = sGrid.value;
            reSelectCd.value = msaveCd.value;
        } else {
            // 조회 후 작업을 진행하여 주세요.
            popup.alert(t('com.message.proceedAfterSearch'));
            return false;
        }
    }
    const insertData = grid.value.getAddedRowItems();
    const updateData = grid.value.getEditedRowItems();

    const saveData = {
        insert: insertData,
        update: updateData,
        userId: userId,
    };
    const saveParams = saveData;
    let count = insertData.length;
    count += updateData.length;

    if (count == 0) {
        // 저장할 데이터가 없습니다.
        popup.alert(t('com.message.noDataToSave'));
        return false;
    }
    if (i == 'L') {
        await lvalidateBeforeSubmit();
        if (validationCheck.value == false) {
            return false;
        }
    } else if (i == 'M') {
        await mvalidateBeforeSubmit();
        if (validationCheck.value == false) {
            return false;
        }
    } else if (i == 'S') {
        await svalidateBeforeSubmit();
        if (validationCheck.value == false) {
            return false;
        }
    }
    // 저장하시겠습니까?
    popup.confirm(t('com.message.confirmSave'), undefined, {
        onOk: async () => {
            confirmOk(saveParams, i);
        },
    });
};

// cell을 클릭하면 다음 그리드 조회 키값 넘김
const rowClick = (e: any) => {
    let grid; //대중소 그리드를 따로 받기 위함
    let flag; //다음 디테일 그리드의 키값
    let selectRow;
    let bfRowIndex;
    let rowIndex;
    if (e == 'L') {
        grid = lGrid.value;

        selectRow = grid.getSelectedRows(); // 선택한 row를 들고옴
        flag = selectRow[0].lclsItemCd; // 해당 row의 대분류코드를 flag 값으로 넣어놓음
        bfRowIndex = grid.getSelectedIndex();
        rowIndex = bfRowIndex[0];

        lsaveCd.value = flag; // insert할 때 필요한 값 저장

        grid.setAllCheckedRows(false); //모든 선택을 해제
        grid.addCheckedRowsByValue('lclsItemCd', flag); // 클릭 행 체크

        if (grid.isAddedByRowIndex(rowIndex) == false) {
            search('M', flag); // 조회
        } else {
            //addedRow면
            mGrid.value.clearGridData();
        }
        sGrid.value.clearGridData();
        msaveCd.value = '';
    }
    if (e == 'M') {
        grid = mGrid.value;
        selectRow = grid.getSelectedRows(); // 선택한 row를 들고옴
        bfRowIndex = grid.getSelectedIndex();
        rowIndex = bfRowIndex[0];
        flag = selectRow[0].mclsItemCd; // 해당 row의 중분류코드를 flag 값으로 넣어놓음

        msaveCd.value = flag; // insert할 때 필요한 값 저장
        grid.setAllCheckedRows(false); //모든 선택을 해제
        grid.addCheckedRowsByValue('mclsItemCd', flag); // 클릭 행 체크

        if (grid.isAddedByRowIndex(rowIndex) == false) {
            search('S', flag); //조회
        } else {
            //addedRow면
            sGrid.value.clearGridData();
        }
    }
    if (e == 'S') {
        grid = sGrid.value;
        selectRow = grid.getSelectedRows(); // 선택한 row를 들고옴
        flag = selectRow[0].sclsItemCd; // 해당 row의 중분류코드를 flag 값으로 넣어놓음
        grid.setAllCheckedRows(false); //모든 선택을 해제
        grid.addCheckedRowsByValue('sclsItemCd', flag); // 클릭 행 체크
    }
};

// 대분류 validation 체크
const lvalidateBeforeSubmit = async () => {
    // 체크할 항목 정의 (기존 lvalidations 대체)
    const checkItems = [
        {
            name: t('menu.label.mainCategoryName'),
            required: true,
            value: 'lclsItemNm',
            maxLength: 100,
        }, // 대분류명
        {
            name: t('com.label.sortSeq'),
            required: true,
            value: 'orderBySeq',
            decimal: true,
            maxValue: 9999999999,
        }, // 정렬순서
        { name: t('com.label.useYn'), required: true, value: 'useYn' }, // 사용여부
    ];

    // biz 공통 유효성 함수 호출
    const result = await utils.validator.validateGridData(lGrid.value, checkItems, t);

    // 결과 처리
    if (!result) {
        validationCheck.value = false;
        return false;
    }

    validationCheck.value = true;
    return true;
};

// 중분류 validation 체크
const mvalidateBeforeSubmit = async () => {
    const checkItems = [
        {
            name: t('menu.label.middleCategoryName'),
            required: true,
            value: 'mclsItemNm',
            maxLength: 100,
        }, // 중분류명
        {
            name: t('com.label.sortSeq'),
            required: true,
            value: 'orderBySeq',
            decimal: true,
            maxValue: 9999999999,
        }, // 정렬순서
        { name: t('com.label.useYn'), required: true, value: 'useYn' }, // 사용여부
    ];

    const result = await utils.validator.validateGridData(mGrid.value, checkItems, t);

    if (!result) {
        validationCheck.value = false;
        return false;
    }

    validationCheck.value = true;
    return true;
};
// 소분류 validation 체크
const svalidateBeforeSubmit = async () => {
    const checkItems = [
        { name: t('item.label.sclsName'), required: true, value: 'sclsItemNm', maxLength: 100 }, // 소분류명
        {
            name: t('com.label.sortSeq'),
            required: true,
            value: 'orderBySeq',
            decimal: true,
            maxValue: 9999999999,
        }, // 정렬순서
        { name: t('com.label.useYn'), required: true, value: 'useYn' }, // 사용여부
    ];

    const result = await utils.validator.validateGridData(sGrid.value, checkItems, t);

    if (!result) {
        validationCheck.value = false;
        return false;
    }

    validationCheck.value = true;
    return true;
};

const confirmOk = async (saveParams: any, i: 'L' | 'M' | 'S') => {
    // 1. Use a lookup object instead of if/else
    const saveFunctions = {
        L: saveItemL,
        M: saveItemM,
        S: saveItemS,
    };

    const fn = saveFunctions[i];

    if (!fn) {
        console.error(`Invalid type: ${i}`);
        return;
    }

    try {
        grid.value.showAjaxLoader();

        const res = await fn(saveParams);

        // Handle result safely
        const resultData = res?.data?.result;
        grid.value.setGridData(resultData);

        popup.alert(t('com.message.itemProcessed', [resultData || 0]));

        // Refresh grid
        await search(i, reSelectCd.value);
    } catch (e: any) {
        popup.alert(e.message);
    } finally {
        grid.value.removeAjaxLoader();
    }
};

const lengthValidation = (event: any) => {
    if (event.columnIndex === 1) {
        if (utils.stringUtil.getByteB(event.value) > 100) {
            // 입력한 값이 너무 깁니다.
            popup.alert(t('com.message.messageTooLong'));
            return event.oldValue;
        }
    }
    if (event.columnIndex === 2) {
        if (Number(event.value) > 9999999999) {
            // 입력한 값이 너무 깁니다.
            popup.alert(t('com.message.messageTooLong'));
            return event.oldValue;
        }
    }
};

// =====================================================================================================
// HOOK 영역
// =====================================================================================================

// 페이지가 로드되기 전에 전체 데이터 출력
onMounted(() => {
    EAT570.unshift({ dtlCommCd: '', dtlCommNm: t('com.label.select') }); // 선택
    EAT571.unshift({ dtlCommCd: '', dtlCommNm: t('com.label.select') }); // 선택
    search('L', null);
    mGrid.value.clearGridData();
    sGrid.value.clearGridData();
});
</script>

<template>
    <!-- 메뉴&공통버튼영역 -->
    <!-- 초기화 -->
    <MenuTop ref="menuTopRef" :menu-info="$props.menuInfo" :methods="{ reset }" />

    <MenuContent>
        <div class="thirdDiv">
            <div>
                <div class="subTitle">
                    <!-- 대분류정보 -->
                    <h3>{{ t('item.label.lclsInfo') }}</h3>

                    <div class="subBtnWrap">
                        <!-- 신규 -->
                        <ComButton :text="t('com.label.new')" @click="lNew()" />
                        <!-- 저장 -->
                        <ComButton :text="t('com.label.save')" @click="save('L')" />
                    </div>
                </div>
                <!--  S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="lGrid"
                        :column-layout="lcolumnLayout"
                        :grid-props="gridProps"
                        @cell-click="rowClick('L')"
                        @cell-edit-end-before="lengthValidation"
                    />
                </div>
                <!--  E : AUI Grid -->
            </div>

            <div>
                <div class="subTitle">
                    <!-- 중분류정보 -->
                    <h3>{{ t('item.label.mclsInfo') }}</h3>
                    <div class="subBtnWrap">
                        <!-- 신규 -->
                        <ComButton :text="t('com.label.new')" @click="mnew()" />
                        <!-- 저장 -->
                        <ComButton :text="t('com.label.save')" @click="save('M')" />
                    </div>
                </div>
                <!--  S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="mGrid"
                        :column-layout="mcolumnLayout"
                        :grid-props="gridProps"
                        @cell-click="rowClick('M')"
                        @cell-edit-end-before="lengthValidation"
                    />
                </div>
                <!--  E : AUI Grid -->
            </div>
            <div>
                <div class="subTitle">
                    <!-- 소분류정보 -->
                    <h3>{{ t('item.label.sclsInfo') }}</h3>
                    <div class="subBtnWrap">
                        <!-- 신규 -->
                        <ComButton :text="t('com.label.new')" @click="snew()" />
                        <!-- 저장 -->
                        <ComButton :text="t('com.label.save')" @click="save('S')" />
                    </div>
                </div>
                <!--  S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="sGrid"
                        :column-layout="scolumnLayout"
                        :grid-props="gridProps"
                        @cell-click="rowClick('S')"
                        @cell-edit-end-before="lengthValidation"
                    />
                </div>
                <!--  E : AUI Grid -->
            </div>
        </div>
    </MenuContent>
</template>
