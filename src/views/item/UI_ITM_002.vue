<script setup lang="ts">
/*
 * @file     UI_ITM_002.vue
 * @menu     품목등록
 * @author   astems
 * @since    2026-06-29
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, onMounted, nextTick, watch, computed, reactive } from 'vue';
import TokenService from '@/common/service/token';
import { useI18n } from 'vue-i18n';

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps, type AUIGridProps } from '@/static/AUIGrid/AUIGridDefault';

import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import SearchArea from '@/components/menu/SearchArea.vue'; // 조회조건 영역
import ComInputbox from '@/components/form/ComInputbox.vue'; // 텍스트 box
import ComSelectbox from '@/components/form/ComSelectbox.vue'; // 선택박스 box
import ItemCdAndNameSearch from '@/components/search/ItemCdAndNameSearch.vue';
import ItemCategory from '@/components/search/ItemCategory.vue';

import { utils } from '@/common/utils';

import { useLayoutStore } from '@/common/stores/layout'; // 레이아웃 store
import { usePopupStore } from '@/common/stores/popup';
import { useCommonCodeStore } from '@/common/stores/commonCode';

import { selectCategories, selectItem, saveItemReg } from '@/api/item';

import type { CategoryGroupsProps, CategoryProps } from '@/types/item';
import type { SelectedMenuProps, MenuMethodsProps } from '@/types/menu';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================
interface SearchParameterProps {
    itemCd: string;
    itemNm: string;
    lclsItemCd: string;
    mclsItemCd: string;
    sclsItemCd: string;
    itemTypeCd: string;
    selfThirdYn: string;
    invMngStdCd: string;
    tranStatCd: string;
}

interface ItemDetailProps {
    chainCd: string;
    itemCd: string;
    itemNm: string;
    labelNm: string;
    taxFreeGbnCd: string;
    lclsItemCd: string;
    mclsItemCd: string;
    sclsItemCd: string;
    spec: string;
    dtlSpec: string;
    originCd: string;
    dtlOrigin: string;
    basUnitCd: string;
    orderContractUnitCd: string;
    boxQty: string;
    packingUnitQty: string;
    oneAnimalQty: string;
    minOrderQty: string;
    decimalPointOrderCd: string;
    displayWt: string;
    distrHistoryMngYn: string;
    distrExpiryDayCnt: string;
    buyerId: string;
    itemTypeCd: string;
    orderCloseCountCd: string;
    keepTempGbnCd: string;
    imgFileId: string;
    itemRating: string;
    selfThirdYn: string;
    invMngStdCd: string;
    tranStatCd: string;
    cowPigGbnFg: string;
    standardPartCd: string;
    useYn: string;
    reportNo: string;
    ingredients: string;
    usage: string;
}
// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
// 메인화면은 필수 - 메뉴정보를 받기 위한 props
const props = defineProps<{
    menuInfo: SelectedMenuProps;
    params: Record<string, undefined>;
}>();

// 공통 메세지 변수
const { t } = useI18n();

const commonCodeStore = useCommonCodeStore();
const GLB200 = computed(() => commonCodeStore.getCode('GLB200'));
const GLB250 = computed(() => commonCodeStore.getCode('GLB250'));
const EAT300 = computed(() => commonCodeStore.getCode('EAT300'));
const GLB300 = computed(() => commonCodeStore.getCode('GLB300'));
const GLB350 = computed(() => commonCodeStore.getCode('GLB350'));
const GLB400 = computed(() => commonCodeStore.getCode('GLB400'));
const GLB450 = computed(() => commonCodeStore.getCode('GLB450'));
const EAT350 = computed(() => commonCodeStore.getCode('EAT350'));
const GLB500 = computed(() => commonCodeStore.getCode('GLB500'));
const EAT400 = computed(() => commonCodeStore.getCode('EAT400'));
const EAT450 = computed(() => commonCodeStore.getCode('EAT450'));
const GLB800 = computed(() => commonCodeStore.getCode('GLB800'));
const GLB810 = computed(() => commonCodeStore.getCode('GLB810'));
const GLB550 = computed(() => commonCodeStore.getCode('GLB550'));
const COM010 = computed(() => commonCodeStore.getCode('COM010'));

const fileAccept = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileInput = ref<HTMLInputElement | null>(null);

const selectedFile = ref<File | null>(null);

const fileName = ref('');

let editFlag = 'D';

const searchParameterInit: SearchParameterProps = {
    itemCd: '',
    itemNm: '',
    lclsItemCd: '',
    mclsItemCd: '',
    sclsItemCd: '',
    itemTypeCd: '',
    selfThirdYn: '',
    invMngStdCd: '',
    tranStatCd: '',
};

const searchParameter = reactive<SearchParameterProps>({
    ...searchParameterInit,
});

// 품목상세정보의 카테고리
const categories = ref<CategoryGroupsProps>({
    lclsCategory: [],
    mclsCategory: [],
    sclsCategory: [],
});

// 품목검색 parameter
const itemParam = ref({
    itemCd: '',
    itemNm: '',
});

// 품목분류
const categoryParam = ref({
    lclsItemCd: '',
    mclsItemCd: '',
    sclsItemCd: '',
});

const itemDetailInit: ItemDetailProps = {
    chainCd: TokenService.getUser().chainCd ?? '',
    itemCd: '',
    itemNm: '',
    labelNm: '',
    taxFreeGbnCd: '',
    lclsItemCd: '',
    mclsItemCd: '',
    sclsItemCd: '',
    spec: '',
    dtlSpec: '',
    originCd: '',
    dtlOrigin: '',
    basUnitCd: '',
    orderContractUnitCd: '',
    boxQty: '',
    packingUnitQty: '',
    oneAnimalQty: '',
    minOrderQty: '',
    decimalPointOrderCd: '',
    displayWt: '',
    distrHistoryMngYn: '',
    distrExpiryDayCnt: '',
    buyerId: '',
    itemTypeCd: '',
    orderCloseCountCd: '',
    keepTempGbnCd: '',
    imgFileId: '',
    itemRating: '',
    selfThirdYn: '',
    invMngStdCd: '',
    tranStatCd: '',
    cowPigGbnFg: '',
    standardPartCd: '',
    useYn: 'Y',
    reportNo: '',
    ingredients: '',
    usage: '',
};

const itemDetail = reactive<ItemDetailProps>({
    ...itemDetailInit,
});

/**입력값 변경감지 */
const changeInfoInit = {
    preItemCd: null,
    changedSet: new Set(),
};
const changeInfo = ref({ ...changeInfoInit });

const popupStore = usePopupStore();

// =====================================================================================================
// 그리드 영역
// =====================================================================================================

// 그리드 높이 계산
const layoutStore = useLayoutStore();
const gridResizeHeight = layoutStore.layoutHeight - utils.biz.MENU_LAYOUT.S2_ST;
const myGrid = ref<AUIGridProps | null>(null);

// 그리드 속성 정의
const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withShowStateColumn(true)
    .withExtraProps({
        rowIdField: '_$uid',
        height: gridResizeHeight,
        enableFilter: true,
        selectionMode: 'singleRow',
        copySingleCellOnRowMode: true, //선택 로우 말고 선택 셀만 복사
    })
    .build();

// 그리드 레이아웃
const columnLayout = [
    { dataField: 'itemCd', headerText: t('item.label.itemCode'), filter: { showIcon: true } }, // 품목코드
    {
        dataField: 'itemNm',
        headerText: t('item.label.itemName'),
        style: 'gridTextAlignLeft',
        width: '40%',
        filter: { showIcon: true },
    }, // 품목명
    { dataField: 'spec', headerText: t('com.label.spec'), filter: { showIcon: false } }, // 규격
    {
        dataField: 'selfThirdYn',
        headerText: t('item.label.ourProduct'),
        filter: { showIcon: true },
    }, // 자사제품
    {
        dataField: 'tranStatCd',
        headerText: t('com.label.status'), // 상태
        filter: { showIcon: false },
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
        ) {
            let columnValue;
            GLB200.value.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    },
];

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

// 카테고리
const selectCategory = () => {
    selectCategories({ chainCd: TokenService.getUser().chainCd })
        .then((res) => {
            categories.value = res?.data?.result ?? {
                lclsCategory: [],
                mclsCategory: [],
                sclsCategory: [],
            };
        })
        .catch((e) => {
            console.log(e.message);
        });
};

// 그리드 셀클릭 - 상세 조회
const showItemDetail = function (e: any) {
    const rowData = e.primeCell.item;

    Object.assign(itemDetail, {
        ...itemDetailInit,
        ...rowData,
    });

    // 파일 input 초기화
    if (fileInput.value) {
        fileInput.value.value = '';
    }

    // 새로 선택한 파일 제거
    selectedFile.value = null;

    // 기존 등록 파일명 표시
    fileName.value = rowData.originalFileName ?? '';

    editFlag = 'E';
};

// 조회 버튼
const search = function () {
    Object.assign(searchParameter, itemParam.value);
    Object.assign(searchParameter, categoryParam.value);

    resetItemDetail();

    selectItem(searchParameter)
        .then((res) => {
            myGrid.value?.setGridData(res?.data?.result ?? []);

            Object.assign(itemDetail, {
                ...itemDetailInit,
            });

            selectedFile.value = null;
            fileName.value = '';

            if (fileInput.value) {
                fileInput.value.value = '';
            }

            if (editFlag == 'E') {
                editFlag = 'F';
            } else {
                editFlag = 'R';
            }

            if (res?.data?.result?.length == 1) {
                myGrid.value?.setSelectionBlock(0, 0, 0, 0);
            }
        })
        .catch((e) => {
            popupStore.alert(e.message);
        });
};

// 신규 버튼
const newRegi = function () {
    const okCallBack = () => {
        myGrid.value?.clearSelection();

        Object.assign(itemDetail, {
            ...itemDetailInit,
        });

        if (fileInput.value) {
            fileInput.value.value = '';
        }

        selectedFile.value = null;
        fileName.value = '';

        changeInfo.value = {
            ...changeInfoInit,
            changedSet: new Set(),
        };
    };
    if (changeInfo.value.changedSet.size > 0) {
        // 변경사항이 있습니다. 변경사항이 저장되지 않습니다. \n 계속하시겠습니까?
        popupStore.confirm(
            t('com.message.confirmContinueBr', [t('com.message.changeNotSavedProceed')]),
            undefined,
            {
                onOk: async () => {
                    okCallBack();
                },
            },
        );
    }
    okCallBack();
};

// 저장 버튼
const save = async function () {
    if (editFlag == 'D') {
        // 조회 후 작업을 진행하여 주세요.
        popupStore.alert(t('com.message.proceedAfterSearch'));
        return;
    }
    if (!(await validateBeforeSubmit())) {
        return;
    }

    // 저장하시겠습니까?
    popupStore.confirm(t('com.message.confirmSave'), undefined, {
        onOk: async () => {
            const formData = new FormData();
            formData.append(
                'item',
                new Blob([JSON.stringify(JSON.parse(JSON.stringify(itemDetail)))], {
                    type: 'application/json',
                }),
            );
            if (selectedFile.value) {
                formData.append('file', selectedFile.value);
            }

            saveItemReg(formData)
                .then(() => {
                    selectedFile.value = null;
                    fileName.value = '';

                    if (fileInput.value) {
                        fileInput.value.value = '';
                    }

                    popupStore.alert(t('com.message.processed'));
                    search();
                })
                .catch((e) => {
                    popupStore.alert(e.error);
                });
        },
    });
};

const copy = () => {
    // 1. 안전하게 추가된 행 가져오기 (null/undefined 방어)
    const addedRows = myGrid.value?.getAddedRowItems() ?? [];

    // 2. 신규 행이 존재할 경우 경고 및 리턴
    if (addedRows.length > 0) {
        popupStore.alert(t('com.message.proceedAfterSave'));
        return;
    }

    // 3. 데이터 복사 및 추가
    myGrid.value?.addRow(
        {
            ...itemDetail,
            itemCd: '-', // 복사 시점에 기본값 처리
        },
        'first',
    );

    // 4. 추가된 후 바로 입력할 수 있도록 UX 개선
    myGrid.value?.setSelectionByIndex(0, 0);
    myGrid.value?.openInputer();
};

// 품목 등록 validation 체크
const validateBeforeSubmit = async () => {
    const checkItems = [
        { name: t('item.label.itemCodeAndName'), required: true, value: itemDetail.itemNm }, // 품목코드/명
        {
            name: t('item.label.taxClassification'),
            required: true,
            value: itemDetail.taxFreeGbnCd,
        }, // 세금구분
        { name: t('item.label.lcls'), required: true, value: itemDetail.lclsItemCd }, // 대분류
        { name: t('item.label.mcls'), required: true, value: itemDetail.mclsItemCd }, // 중분류
        { name: t('item.label.scls'), required: true, value: itemDetail.sclsItemCd }, // 소분류
        { name: t('com.label.origin'), required: true, value: itemDetail.originCd }, // 원산지
        { name: t('item.label.baseUnitCode'), required: true, value: itemDetail.basUnitCd }, // 기본단위코드
        {
            name: t('item.label.purchaseOrderUnit'),
            required: true,
            value: itemDetail.orderContractUnitCd,
        }, // 수발주 단위
        {
            name: t('item.label.purchaseOrderUnitQuantity'),
            required: true,
            value: itemDetail.boxQty,
            decimal: true,
        }, // 수발주단위 입수량
        {
            name: t('item.label.purchaseOrderUnitQty'),
            required: true,
            value: itemDetail.packingUnitQty,
            decimal: true,
        }, // 발주단위수량
        {
            name: t('item.label.minPurchaseOrderQty'),
            required: true,
            value: itemDetail.minOrderQty,
        }, // 최소발주수량
        { name: t('item.label.displayWeight'), value: itemDetail.displayWt, decimal: true }, // 표시중량
        {
            name: t('item.label.decimalPurchaseOrderFlag'),
            required: true,
            value: itemDetail.decimalPointOrderCd,
        }, // 소숫점발주구분
        {
            name: t('item.label.distributionTraceManageYn'),
            required: true,
            value: itemDetail.distrHistoryMngYn,
        }, // 유통이력관리여부
        {
            name: t('item.label.expireDateDays'),
            value: itemDetail.distrExpiryDayCnt,
            decimal: true,
        }, // 유통기한일수
        {
            name: t('item.label.storageTemperatureFlag'),
            required: true,
            value: itemDetail.keepTempGbnCd,
        }, // 보관온도구분
        { name: t('item.label.itemGrade'), required: true, value: itemDetail.itemRating }, // 품목등급
        {
            name: t('customer.label.tradeStatus'),
            required: true,
            value: itemDetail.tranStatCd,
        }, // 거래상태
        { name: t('item.label.companyType'), required: true, value: itemDetail.selfThirdYn }, // 자/타사구분
        {
            name: t('item.label.oneCowQuantity'),
            required: true,
            value: itemDetail.oneAnimalQty,
            decimal: true,
        }, // 소한마리 입수량
        {
            name: t('item.label.stockManageStandard'),
            required: true,
            value: itemDetail.invMngStdCd,
        }, // 재고관리기준
        {
            name: t('item.label.standardClassCode'),
            required: true,
            value: itemDetail.cowPigGbnFg,
        }, // 표준분류코드
        {
            name: t('item.label.standardSectionCode'),
            required: true,
            value: itemDetail.standardPartCd,
        }, // 표준부위코드
    ];

    const result = await utils.validator.validateBeforeSubmit(checkItems, t);

    if (!result) return false;
    return true;
};

const uploadFile = function (e: any) {
    const files = e.target.files;

    if (!files || files.length === 0) {
        selectedFile.value = null;
        fileName.value = '';
        return;
    }

    const file = files[0];

    if (fileAccept.indexOf(file.type) === -1) {
        popupStore.alert(t('item.message.imageUploadMsg'));

        // input 초기화
        e.target.value = '';

        selectedFile.value = null;
        fileName.value = '';
        return;
    }

    // 실제 업로드 파일 저장
    selectedFile.value = file;

    // 화면 표시용 파일명 저장
    fileName.value = file.name;
};

const resetItemDetail = function () {
    if (changeInfo.value.changedSet.size > 0) {
        popupStore.confirm(
            t('com.message.confirmContinueBr', [t('com.message.changeNotSavedProceed')]),
            undefined,
            {
                onOk: async () => {
                    Object.assign(itemDetail, {
                        ...itemDetailInit,
                    });

                    selectedFile.value = null;
                    fileName.value = '';

                    if (fileInput.value) {
                        fileInput.value.value = '';
                    }
                },
            },
        );
    }
};

const reset = function () {
    // 검색 파라미터 초기화
    Object.assign(searchParameter, searchParameterInit);

    // 품목검색창 초기화
    Object.assign(itemParam.value, {
        itemCd: '',
        itemNm: '',
    });

    // 조회
    search();

    // 상세정보 초기화
    Object.assign(itemDetail, {
        ...itemDetailInit,
    });

    // 파일 초기화
    selectedFile.value = null;
    fileName.value = '';

    if (fileInput.value) {
        fileInput.value.value = '';
    }

    // 변경정보 초기화
    changeInfo.value = {
        ...changeInfoInit,
        changedSet: new Set(),
    };
};

const popup_usrP01 = function () {
    popupStore.openPopup('biz', 'UI_USR_P01', {
        userId: '',
        userNm: '',
        userTypeCd: '10',
        menuGrpCd: '',
        width: 600,
        height: 400,
        onOk: () => {
            callbackUserOk();
        },
        onCancel: () => {
            callbackUserCancel();
        },
    });
};
const callbackUserOk = function (param?: any[]) {
    const user = param?.[0];

    if (!user) {
        return;
    }

    itemDetail.buyerId = user.userId;
};
const callbackUserCancel = function () {
    itemDetail.buyerId = '';
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
watch(
    () => itemDetail.cowPigGbnFg,
    async (newValue, oldValue) => {
        if (newValue === oldValue) {
            return;
        }

        await nextTick();

        const exist = GLB810.value.some(
            (v: any) => v.dtlRef01Nm === newValue && v.dtlCommCd === itemDetail.standardPartCd,
        );

        if (!exist) {
            itemDetail.standardPartCd = '';
        }
    },
);

onMounted(() => {
    selectCategory();
    search();
});

const lclsOptions = computed(() => {
    return categories?.value?.lclsCategory?.map((v: CategoryProps) => ({
        dtlCommCd: v.categoryCd,
        dtlCommNm: v.categoryNm,
    }));
});

const mclsOptions = computed(() => {
    return (categories.value.mclsCategory ?? [])
        .filter((i) => i.parentCd === itemDetail.lclsItemCd)
        .map((v) => ({
            dtlCommCd: v.categoryCd,
            dtlCommNm: v.categoryNm,
        }));
});

const sclsOptions = computed(() => {
    return (categories?.value?.sclsCategory ?? [])
        .filter((i: CategoryProps) => i.parentCd === itemDetail.mclsItemCd)
        .map((v: CategoryProps) => ({
            dtlCommCd: v.categoryCd,
            dtlCommNm: v.categoryNm,
        }));
});

const minOrderQtyOptions = ['1', '2', '3', '4', '5'].map((v) => ({
    dtlCommCd: v,
    dtlCommNm: v,
}));

const methods: MenuMethodsProps = {
    reset,
    search,
    newRegi,
    save,
    copy,
};
</script>

<template>
    <!-- 메뉴&공통버튼영역 -->
    <MenuTop ref="menuTopRef" :menu-info="props.menuInfo" :methods="methods" />

    <MenuContent>
        <!-- S : 검색조건-->
        <SearchArea>
            <!-- 품목코드/명 -->
            <li>
                <ItemCdAndNameSearch
                    ref="itemCdInputRef"
                    v-model="itemParam"
                    :label="t('item.label.itemCodeAndName')"
                />
            </li>
            <!-- 대분류, 중분류, 소분류 -->
            <ItemCategory v-model="categoryParam" />

            <!-- 거래상태 -->
            <li>
                <div class="search_container">
                    <label>{{ t('customer.label.tradeStatus') }}</label>
                    <!-- 거래상태 -->
                    <ComSelectbox
                        v-model="searchParameter.tranStatCd"
                        :select-type="'A'"
                        :options="GLB200"
                    />
                </div>
            </li>
            <!-- 자/타사구분 -->
            <li>
                <div class="search_container">
                    <label>{{ t('item.label.companyType') }}</label>
                    <!-- 자/타사구분 -->
                    <ComSelectbox
                        v-model="searchParameter.selfThirdYn"
                        :select-type="'A'"
                        :options="GLB550"
                    />
                </div>
            </li>
        </SearchArea>
        <!--- E : 검색조건 -->

        <div class="halfDiv">
            <div>
                <div class="subTitle">
                    <h3>{{ t('com.label.list') }}</h3>
                </div>
                <!-- 목록 -->
                <!--  S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGrid"
                        :column-layout="columnLayout"
                        :grid-props="gridProps"
                        @selection-change="showItemDetail"
                    />
                </div>
                <!--  E : AUI Grid -->
            </div>
            <div class="form-sections-wrapper">
                <!-- 기존 품목상세정보 영역 -->
                <div class="form-section item-detail-section">
                    <div class="subTitle">
                        <h3>{{ t('item.label.itemDetailInfo') }}</h3>
                    </div>
                    <!-- 품목상세정보 -->
                    <div :style="{ height: gridResizeHeight + 'px', overflowY: 'auto' }">
                        <table class="tableLayout">
                            <colgroup>
                                <col style="width: 18%" />
                                <col style="width: 32%" />
                                <col style="width: 22%" />
                                <col style="width: 28%" />
                            </colgroup>
                            <tbody>
                                <tr>
                                    <th>{{ '* ' + t('item.label.itemCodeAndName') }}</th>
                                    <!-- * 품목코드/명 -->
                                    <td colspan="2" class="double">
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <div class="form_wrap from_wrap_mypage">
                                                    <ComInputbox
                                                        v-model="itemDetail.itemCd"
                                                        type="text"
                                                        readonly
                                                    />
                                                </div>
                                            </span>
                                        </div>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComInputbox
                                                    v-model="itemDetail.itemNm"
                                                    type="text"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.taxClassification') }}</th>
                                    <!-- * 세금구분 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.taxFreeGbnCd"
                                                    :options="GLB250"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <th>{{ '* ' + t('item.label.lcls') }}</th>
                                    <!-- * 대분류 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.lclsItemCd"
                                                    :options="lclsOptions"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.mcls') }}</th>
                                    <!-- * 중분류 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.mclsItemCd"
                                                    :options="mclsOptions"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <th>{{ '* ' + t('item.label.scls') }}</th>
                                    <!-- * 소분류 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.sclsItemCd"
                                                    :options="sclsOptions"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ t('com.label.spec') }}</th>
                                    <!-- 규격 -->
                                    <td>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComInputbox
                                                    v-model="itemDetail.spec"
                                                    type="text"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <th>{{ t('item.label.detailSpec') }}</th>
                                    <!-- 상세규격 -->
                                    <td>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComInputbox
                                                    v-model="itemDetail.dtlSpec"
                                                    type="text"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <!-- * 기본단위코드 단위 -->
                                    <th>{{ '* ' + t('item.label.baseUnitCode') }}</th>
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.basUnitCd"
                                                    :options="GLB300"
                                                />
                                            </div>
                                        </div>
                                    </td>

                                    <th>{{ '* ' + t('item.label.purchaseOrderUnit') }}</th>
                                    <!-- * 수발주 단위 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.orderContractUnitCd"
                                                    :options="GLB350"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('com.label.origin') }}</th>
                                    <!-- * 원산지 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.originCd"
                                                    :options="EAT300"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <th>{{ t('item.label.originDetail') }}</th>
                                    <!-- 원산지상세 -->
                                    <td>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComInputbox
                                                    v-model="itemDetail.dtlOrigin"
                                                    type="text"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.purchaseOrderUnitQuantity') }}</th>
                                    <!-- * 수발주단위 입수량 -->
                                    <td>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComInputbox
                                                    v-model="itemDetail.boxQty"
                                                    type="number"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <th>{{ '* ' + t('item.label.purchaseOrderUnitQty') }}</th>
                                    <!-- * 발주단위수량 -->
                                    <td>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComInputbox
                                                    v-model="itemDetail.packingUnitQty"
                                                    type="number"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.minPurchaseOrderQty') }}</th>
                                    <!-- * 최소발주수량 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.minOrderQty"
                                                    :options="minOrderQtyOptions"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <th>{{ '* ' + t('item.label.decimalPurchaseOrderFlag') }}</th>
                                    <!-- * 소숫점발주구분 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.decimalPointOrderCd"
                                                    :options="GLB400"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ t('item.label.displayWeightKg') }}</th>
                                    <!-- 표시중량(Kg) -->
                                    <td>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComInputbox
                                                    v-model="itemDetail.displayWt"
                                                    type="number"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <th class="line2">
                                        {{ '*' + t('item.label.distributionTraceManageYn') }}
                                        <br />
                                        ({{ t('item.label.nonQuantitativeYn') }})
                                    </th>
                                    <!-- 유통이력관리여부(비정량여부) -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.distrHistoryMngYn"
                                                    :options="COM010"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ t('item.label.expireDateDays') }}</th>
                                    <!-- 유통기한일수 -->
                                    <td>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComInputbox
                                                    v-model="itemDetail.distrExpiryDayCnt"
                                                    type="number"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <th>{{ t('item.label.assignBuyer') }}</th>
                                    <!-- 담당바이어 -->
                                    <td>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input search">
                                                <ComInputbox
                                                    v-model="itemDetail.buyerId"
                                                    type="text"
                                                    placeholder="Search"
                                                    readonly
                                                />
                                                <button
                                                    class="btn_input input_search"
                                                    @click="popup_usrP01"
                                                >
                                                    <span class="a11y">
                                                        {{ t('com.label.find') }}
                                                    </span>
                                                </button>
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.itemType') }}</th>
                                    <!-- 품목유형 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.itemTypeCd"
                                                    :options="GLB450"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <th>{{ t('item.label.purchaseOrderNumber') }}</th>
                                    <!-- 발주차수 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.orderCloseCountCd"
                                                    :options="EAT350"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.storageTemperatureFlag') }}</th>
                                    <!-- 보관온도구분 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.keepTempGbnCd"
                                                    :options="GLB500"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <th>{{ t('item.label.itemFile') }}</th>
                                    <!-- 품목사진 -->
                                    <td>
                                        <div class="fileBox w100p">
                                            <ComInputbox
                                                v-model="fileName"
                                                type="text"
                                                placeholder="Search"
                                                disabled
                                            />
                                            <input
                                                id="file"
                                                type="file"
                                                accept="fileAccept"
                                                @change="uploadFile"
                                            />
                                            <label for="file"></label>

                                            <button
                                                v-if="itemDetail.imgFileId"
                                                type="button"
                                                class="btn-download"
                                                @click="
                                                    utils.file.download(
                                                        itemDetail?.imgFileId,
                                                        fileName,
                                                    )
                                                "
                                            ></button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.itemGrade') }}</th>
                                    <!-- 품목등급 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.itemRating"
                                                    :options="EAT400"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <th>{{ '* ' + t('customer.label.tradeStatus') }}</th>
                                    <!-- * 거래상태 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.tranStatCd"
                                                    :options="GLB200"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.companyType') }}</th>
                                    <!-- 자/타사 구분 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.selfThirdYn"
                                                    :options="GLB550"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <th class="line2">
                                        {{ '* ' + t('item.label.oneCow') }}
                                        <br />
                                        {{ t('com.label.quantity') }}
                                    </th>
                                    <!-- 소한마리<br />입수량 -->
                                    <td>
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComInputbox
                                                    v-model="itemDetail.oneAnimalQty"
                                                    type="number"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.stockManageStandard') }}</th>
                                    <!-- * 재고관리기준 -->
                                    <td colspan="1">
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.invMngStdCd"
                                                    :options="EAT450"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <th>{{ '* ' + t('item.label.standardClassCode') }}</th>
                                    <!-- * 표준분류코드 -->
                                    <td>
                                        <div class="form_wrap">
                                            <div class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.cowPigGbnFg"
                                                    :options="GLB800"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <th>{{ '* ' + t('item.label.standardSectionCode') }}</th>
                                    <!-- * 표준부위코드 -->
                                    <td colspan="2">
                                        <div class="form_wrap">
                                            <span class="form_cell form_input">
                                                <ComSelectbox
                                                    v-model="itemDetail.standardPartCd"
                                                    :options="GLB810"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </MenuContent>
</template>

<style scoped>
.labelNm {
    height: 30px !important;
    border: 1px solid #d5d5d5;
    padding: 8px;
    outline: none;
    /* 브라우저 기본 테두리 제거 */
}

.labelNm:focus {
    border: 1px solid #707070;
}

/* Chrome, Safari, Edge, Opera */
.labelNm::-webkit-outer-spin-button,
.labelNm::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
.labelNm[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
}

.form-sections-wrapper {
    display: flex;
    flex-direction: column;
    /* gap: 24px; */
    /* padding: 12px 0; */
}

.form-section h3 {
    /* margin-bottom: 12px; */
    font-size: 16px;
    font-weight: bold;
    color: #333;
    /* margin-top:10px; */
}

.label-print-section .form_input,
.label-print-section .select_w28 {
    width: 100%;
    /* padding: 6px 8px; */
    border: 1px solid #d5d5d5;
    border-radius: 4px;
}
.halfDiv {
    display: flex;
    align-items: flex-start;
    gap: 24px;
}

/* 왼쪽 그리드 영역 (높이 자동 확장) */
.halfDiv > div:first-child {
    flex: 1;
}

/* 오른쪽 폼 영역 (자동 확장) */
.halfDiv > div:last-child {
    flex: 1.5;
}

.form_cell.form_input.search {
    position: relative;
    padding-right: 30px; /* input이 버튼과 겹치지 않도록 */
}

.btn_input.input_search {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    z-index: 10;
}
</style>
