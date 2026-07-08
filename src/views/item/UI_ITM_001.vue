<script setup lang="ts">
/*
 * @file     UI_ITM_001.vue
 * @menu     품목분류관리
 * @author   astems
 * @since    2026-06-29
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, onMounted, computed } from 'vue';

import { useI18n } from 'vue-i18n';

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps, type AUIGridProps } from '@/static/AUIGrid/AUIGridDefault';

import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import ComButton from '@/components/form/ComButton.vue';

import { useLayoutStore } from '@/common/stores/layout'; // 레이아웃 store
import { usePopupStore } from '@/common/stores/popup';
import { useCommonCodeStore } from '@/common/stores/commonCode';

import { utils } from '@/common/utils';

// api
import {
    selectItemListL,
    selectItemListM,
    selectItemListS,
    saveItemL,
    saveItemM,
    saveItemS,
} from '@/api/item';

import type { SelectedMenuProps, MenuMethodsProps } from '@/types/menu';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================

// 메인화면은 필수 - 메뉴정보를 받기 위한 props
const props = defineProps<{
    menuInfo: SelectedMenuProps;
    params: Record<string, undefined>;
}>();

// 메세지 변수
const { t } = useI18n();

const lGrid = ref<AUIGridProps | null>(null);
const mGrid = ref<AUIGridProps | null>(null);
const sGrid = ref<AUIGridProps | null>(null);
const grid = ref<AUIGridProps | null>(null);

// 신규나 저장 버튼을 위한 flag 값 (false : 조회 전, true : 조회 후)
const mitemFg = ref(false);
const sitemFg = ref(false);

const commonCodeStore = useCommonCodeStore();
const EAT570 = computed(() => commonCodeStore.getCode('EAT570'));
const EAT571 = computed(() => commonCodeStore.getCode('EAT571'));
const COM010 = computed(() => commonCodeStore.getCode('COM010'));

const lsaveCd = ref('');
const msaveCd = ref('');

const popupStore = usePopupStore();

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
const search = async (type: 'L' | 'M' | 'S', f: any) => {
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

    const target = config[type];
    if (!target) return;

    grid.value = target.grid.value;

    try {
        const res = await target.fn(target.params);
        grid.value?.setGridData(res?.data?.result ?? []);
        (target as any).onSuccess?.();
    } catch (e: any) {
        popupStore.alert(e.message);
    }
};

//
// 초기화 버튼
const reset = () => {
    search('L', null);
    mGrid.value?.clearGridData();
    sGrid.value?.clearGridData();
    lsaveCd.value = '';
    msaveCd.value = '';
};

//
// 신규 버튼
// 대분류 신규버튼
const lNew = () => {
    const grid = lGrid.value; // 대분류 그리드 연결

    const seqArray = (grid?.getColumnValues('orderBySeq', false) || [])
        .map(Number)
        .filter((val) => !isNaN(val)); // 숫자가 아닌 값이 섞여있을 경우 대비

    // 2. 로직 처리
    let seq: number;

    if (seqArray.length === 0) {
        seq = 1; // 데이터가 하나도 없을 경우 1번으로 시작
    } else {
        // Math.max(...seqArray)는 배열이 클 경우 스택 오버플로우 위험이 있을 수 있으나,
        // 그리드 행 단위라면 충분히 안전합니다.
        seq = Math.max(...seqArray) + 1;
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
    grid?.addRow(obj, 'first');
    grid?.setAllCheckedRows(false); //모든 선택을 해제
    grid?.setSelectionByIndex(0, 1); //대분류코드는 입력불가, 대분류명을 바로 입력할 수 있게 selection 걸음
    grid?.openInputer();
    mGrid.value?.clearGridData();
    sGrid.value?.clearGridData();
    lsaveCd.value = '';
    grid?.addCheckedRowsByValue('check', 'Y');
};

// 중분류 신규버튼
const mnew = () => {
    if (lsaveCd.value != '') {
        const grid = mGrid.value; // 중분류 그리드 연결

        const seqArray = (grid?.getColumnValues('orderBySeq', false) || [])
            .map(Number)
            .filter((val) => !isNaN(val));

        // 2. 최대값 계산
        let seq: number;

        if (seqArray.length === 0) {
            seq = 1; // 데이터가 없으면 1로 시작
        } else {
            seq = Math.max(...seqArray) + 1;
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
        grid?.addRow(obj, 'first');
        grid?.setAllCheckedRows(false); //모든 선택을 해제
        grid?.setSelectionByIndex(0, 1); //대분류코드는 입력불가, 대분류명을 바로 입력할 수 있게 selection 걸음
        grid?.openInputer();
        sGrid.value?.clearGridData();
        msaveCd.value = '';
        grid?.addCheckedRowsByValue('check', 'Y');
    } else {
        // 조회 후 작업을 진행하여 주세요
        popupStore.alert(t('com.message.proceedAfterSearch'));
        return false;
    }
};
// 소분류 신규버튼
const snew = () => {
    if (msaveCd.value != '') {
        const grid = sGrid.value; // 소분류 그리드 연결

        const seqArray = (grid?.getColumnValues('orderBySeq', false) || [])
            .map(Number)
            .filter((val) => !isNaN(val));

        // 2. 최대값 계산
        let seq: number;

        if (seqArray.length === 0) {
            seq = 1; // 데이터가 없으면 1로 시작
        } else {
            seq = Math.max(...seqArray) + 1;
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
        grid?.addRow(obj, 'first');
        grid?.setAllCheckedRows(false); //모든 선택을 해제
        grid?.setSelectionByIndex(0, 1); //대분류코드는 입력불가, 대분류명을 바로 입력할 수 있게 selection 걸음
        grid?.openInputer(); //소분류명 입력창 바로열기
        grid?.addCheckedRowsByValue('check', 'Y');
    } else {
        // 조회 후 작업을 진행하여 주세요.
        popupStore.alert(t('com.message.proceedAfterSearch'));
        return false;
    }
};

//
//저장 버튼
const save = async (type: 'L' | 'M' | 'S') => {
    if (type == 'L') {
        grid.value = lGrid.value;
    } else if (type == 'M') {
        if (mitemFg.value == true) {
            grid.value = mGrid.value;
            reSelectCd.value = lsaveCd.value;
        } else {
            // 조회 후 작업을 진행하여 주세요.
            popupStore.alert(t('com.message.proceedAfterSearch'));
            return false;
        }
    } else if (type == 'S') {
        if (sitemFg.value == true) {
            grid.value = sGrid.value;
            reSelectCd.value = msaveCd.value;
        } else {
            // 조회 후 작업을 진행하여 주세요.
            popupStore.alert(t('com.message.proceedAfterSearch'));
            return false;
        }
    }
    const insertData = grid.value?.getAddedRowItems() ?? [];
    const updateData = grid.value?.getEditedRowItems() ?? [];

    const saveData = {
        insert: insertData,
        update: updateData,
    };
    const saveParams = saveData;
    let count = insertData.length;
    count += updateData.length;

    if (count == 0) {
        // 저장할 데이터가 없습니다.
        popupStore.alert(t('com.message.noDataToSave'));
        return false;
    }
    if (type == 'L') {
        await lvalidateBeforeSubmit();
        if (validationCheck.value == false) {
            return false;
        }
    } else if (type == 'M') {
        await mvalidateBeforeSubmit();
        if (validationCheck.value == false) {
            return false;
        }
    } else if (type == 'S') {
        await svalidateBeforeSubmit();
        if (validationCheck.value == false) {
            return false;
        }
    }
    // 저장하시겠습니까?
    popupStore.confirm(t('com.message.confirmSave'), undefined, {
        onOk: async () => {
            confirmOk(saveParams, type);
        },
    });
};

// cell을 클릭하면 다음 그리드 조회 키값 넘김
const rowClick = (type: 'L' | 'M' | 'S') => {
    // 1. 타입별 그리드 및 데이터 필드 매핑 (반복 제거)
    const configs = {
        L: { grid: lGrid.value, key: 'lclsItemCd', nextType: 'M', nextSearch: true },
        M: { grid: mGrid.value, key: 'mclsItemCd', nextType: 'S', nextSearch: true },
        S: { grid: sGrid.value, key: 'sclsItemCd', nextType: null, nextSearch: false },
    } as const;

    const config = configs[type];
    const grid = config?.grid;

    // 2. 안전한 데이터 추출
    const [selectedItem] = grid?.getSelectedRows() || [];
    const rowIndex = grid?.getSelectedIndex() ?? -1;

    if (!selectedItem || rowIndex === -1) return;

    const flag = selectedItem[config.key];

    // 3. 그리드 상태 초기화 및 체크 처리
    grid?.setAllCheckedRows(false);
    grid?.addCheckedRowsByValue(config.key, flag);

    // 4. 로직 수행
    if (type === 'L') lsaveCd.value = flag;
    if (type === 'M') msaveCd.value = flag;

    // 5. 하위 그리드 연동 로직
    if (config.nextType) {
        const isAdded = grid?.isAddedByRowIndex(rowIndex);

        if (isAdded === false) {
            search(config.nextType, flag);
        } else {
            // 하위 그리드 초기화
            const nextGrid = (config.nextType === 'M' ? mGrid : sGrid).value;
            nextGrid?.clearGridData();
        }
    }

    // L 클릭 시 S도 초기화 등 상세 로직
    if (type === 'L') {
        sGrid.value?.clearGridData();
        msaveCd.value = '';
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
        const res = await fn(saveParams);

        const resultData = res?.data?.result;
        grid.value?.setGridData(resultData);

        popupStore.alert(t('com.message.itemProcessed', [resultData || 0]));

        // Refresh grid
        await search(i, reSelectCd.value);
    } catch (e: any) {
        popupStore.alert(e.message);
    }
};

const lengthValidation = (event: any) => {
    if (event.columnIndex === 1) {
        if (utils.stringUtil.getByteB(event.value) > 100) {
            // 입력한 값이 너무 깁니다.
            popupStore.alert(t('com.message.messageTooLong'));
            return event.oldValue;
        }
    }
    if (event.columnIndex === 2) {
        if (Number(event.value) > 9999999999) {
            // 입력한 값이 너무 깁니다.
            popupStore.alert(t('com.message.messageTooLong'));
            return event.oldValue;
        }
    }
};

const methods: MenuMethodsProps = {
    reset,
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================

// 페이지가 로드되기 전에 전체 데이터 출력
onMounted(() => {
    EAT570.value.unshift({ dtlCommCd: '', dtlCommNm: t('com.label.select') }); // 선택
    EAT571.value.unshift({ dtlCommCd: '', dtlCommNm: t('com.label.select') }); // 선택
    search('L', null);
    mGrid.value?.clearGridData();
    sGrid.value?.clearGridData();
});
</script>

<template>
    <!-- 메뉴&공통버튼영역 -->
    <!-- 초기화 -->
    <MenuTop ref="menuTopRef" :menu-info="props.menuInfo" :methods="methods" />

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
