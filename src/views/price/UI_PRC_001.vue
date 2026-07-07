<script setup lang="ts">
/*
 * @file     UI_PRC_001.vue
 * @menu     매입단가그룹설정 및 매핑 관리
 * @author   astems
 * @since    2026-07-03
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, onMounted, computed } from 'vue';
import TokenService from '@/common/service/token';
import { useI18n } from 'vue-i18n';

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps, type AUIGridProps } from '@/static/AUIGrid/AUIGridDefault';

import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import SearchArea from '@/components/menu/SearchArea.vue'; // 조회조건 영역
import ComInputbox from '@/components/form/ComInputbox.vue'; // 텍스트 box
import ComDateSelect from '@/components/form/ComDateSelect.vue';
import ComButton from '@/components/form/ComButton.vue';

import { utils } from '@/common/utils';

import { useLayoutStore } from '@/common/stores/layout'; // 레이아웃 store
import { usePopupStore } from '@/common/stores/popup';
import { useCommonCodeStore } from '@/common/stores/commonCode';

import dayjs from 'dayjs';

// api
import {
    copyPurchaseGroup /*복사*/,
    selectPriceGroup /*매입단가그룹 조회*/,
    selectPriceItem /*품목 조회*/,
    selectPriceItemLog /*품목상세로그조회*/,
    checkUsableGrp /*매입단가그룹 사용 여부 조회*/,
    saveGroupList /*그룹저장*/,
    saveItemList /*품목저장*/,
    saveExcelItemList /*엑셀업로드저장*/,
} from '@/api/price';

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
// 메인화면은 필수 - 메뉴정보를 받기 위한 props
defineProps<{
    menuInfo: any;
    params: Record<string, any>;
}>();

// 공통 메세지 변수
const { t } = useI18n();

const commonCodeStore = useCommonCodeStore();
const GLB250 = computed(() => commonCodeStore.getCode('GLB250'));
const EAT400 = computed(() => commonCodeStore.getCode('EAT400'));
const EAT300 = computed(() => commonCodeStore.getCode('EAT300'));
const GLB600 = computed(() => commonCodeStore.getCode('GLB600'));
const COM010 = computed(() => commonCodeStore.getCode('COM010'));
const COM170 = computed(() => commonCodeStore.getCode('COM170'));

const today = dayjs(new Date()).format('YYYYMMDD');

const pickedDate = ref<Date | null>(null);
const amountPrice = ref('');
const realCompare = ref<Date | null>(null);
const addFlag = ref(false);
const purchGrpCd = ref('');
const grpFlag = ref(true);
const rowIdFg = ref('');
const itemFlag = ref(true);
const loginUser = TokenService.getUser();
const validationCheck = ref(true);

const searchParameter = ref({
    itemCd: '',
    itemNm: '',
    lclsItemCd: '',
    mclsItemCd: '',
    sclsItemCd: '',
    itemTypeCd: '',
    selfThirdYn: '',
    invMngStdCd: '',
    tranStatCd: '',
    isMulti: true,
});

const purchPrcGrpNm = ref('');
const currentDate = ref('');
const curPrice = ref('');

const popupStore = usePopupStore();

let allChecked = false;

// 엑셀양식 다운로드 그리드 생성
const exportGrid = ref<AUIGridProps | null>(null);

const exportGirdProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({ showRowNumColumn: false })
    .build();

// 매입단가그룹 그리드 레이아웃
const exportGridLayout = [
    {
        dataField: 'purchPrcGrpCd',
        headerText: t('price.label.unitPriceGroupCode'),
    },
    {
        dataField: 'purchPrcGrpNm',
        headerText: t('item.label.itemCode'),
    },
    {
        dataField: 'countItem',
        headerText: t('price.label.applyDate'),
    },
    {
        dataField: 'useYn',
        headerText: t('item.label.purchaseUnitPrice'),
    },
];

// =====================================================================================================
// 그리드 영역
// =====================================================================================================

// 그리드 높이 계산
const layoutStore = useLayoutStore();
const gridResizeHeightGrp = layoutStore.layoutHeight - utils.biz.MENU_LAYOUT.ST;
const gridResizeHeightItem = 280;
const gridResizeHeightDtl =
    gridResizeHeightGrp -
    gridResizeHeightItem -
    utils.biz.MENU_LAYOUT.COMP_TYPE_HEIGHT.SUB_TITLE -
    utils.biz.MENU_LAYOUT.COMP_TYPE_HEIGHT.SEARCH -
    20;

const myGrid1 = ref<AUIGridProps | null>(null);
const myGrid2 = ref<AUIGridProps | null>(null);
const myGrid3 = ref<AUIGridProps | null>(null);

// 그리드 속성 정의
const gridProps1: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        enableFilter: true,
        rowIdField: 'purchPrcGrpCd',
        rowIdTrustMode: true,
        editable: true,
        height: gridResizeHeightGrp,
        showRowNumColumn: false,
        showRowCheckColumn: true, // 체크박스 표시 설정
        showRowAllCheckBox: false,
        showStateColumn: true,
    })
    .build();

const gridProps2: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        editable: true,
        showRowNumColumn: true,
        showRowCheckColumn: true, // 체크박스 표시 설정
        showRowAllCheckBox: true,
        showStateColumn: true,
        softRemoveRowMode: true,
        enableFilter: true,
        height: gridResizeHeightItem,
        // independentAllCheckBox: true,
        rowCheckableWithDisabled: true,
        rowCheckableFunction: function (_rowIndex: number, _isChecked: boolean, _item: any) {
            if (_item.currentDate?.replace(/[^0-9]/, '') < today && _item.currentDate !== '') {
                // 값이 있으면 체크불가. disabeld 처리함
                return false; // false 반환하면 disabled 처리됨
            }
            return true;
        },
    })
    .build();

const gridProps3: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: gridResizeHeightDtl,
    })
    .build();

// 매입단가그룹 그리드 레이아웃
const columnLayout1 = [
    {
        dataField: 'purchPrcGrpCd',
        headerText: t('price.label.unitPriceGroupCode'),
        editable: false,
        width: '24%',
        filter: { showIcon: true },
    }, // 단가그룹코드
    {
        dataField: 'purchPrcGrpNm',
        headerText: t('price.label.unitPriceGroupName'),
        style: 'gridTextAlignLeft',
        width: '40%',
        filter: { showIcon: true },
    }, // 단가그룹명
    {
        dataField: 'countItem',
        headerText: `${t('com.label.item')}<br/>${t('com.label.cnt')}`,
        editable: false,
        style: 'gridTextAlignRight',
        width: '14%',
    }, // 품목<br/>건수
    {
        dataField: 'useYn',
        headerText: t('com.label.useYn'), // 사용여부
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM010,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
            disabledFunction: function (
                _rowIndex: number,
                _columnIndex: number,
                _value: string,
                _item: any,
                _dataField: any,
            ) {
                // 행 아이템의 position 이 이사 라면 비활성화 처리
                if (grpFlag.value == false) {
                    return true;
                }
                return false;
            },
        },
    },
];

// 매입단가 품목 그리드 레이아웃
const columnLayout2 = [
    { dataField: 'originDate', headerText: t('price.label.existingApplyDate'), visible: false }, // 기존적용일자
    {
        dataField: 'purchPrcGrpCd',
        headerText: t('customer.label.purchaseUnitPriceGroupCode'),
        visible: false,
        filter: { showIcon: true },
    }, // 매입단가그룹코드
    {
        dataField: 'itemCd',
        headerText: t('item.label.itemCode'),
        editable: false,
        filter: { showIcon: true },
    }, // 품목코드
    {
        dataField: 'itemNm',
        headerText: t('item.label.itemName'),
        editable: false,
        style: 'gridTextAlignLeft',
        width: '25%',
        filter: { showIcon: true },
    }, // 품목명
    {
        dataField: 'taxFreeGbnCd',
        headerText: t('item.label.taxClassification'), // 세금구분
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
        ) {
            let columnValue;
            GLB250.value.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
        editable: false,
    },
    {
        dataField: 'currentDate',
        headerText: t('price.label.applyDate'), // 적용일자
        width: 110,
        dataType: 'date',
        dateInputFormat: 'yyyymmdd', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd', // 그리드에 보여줄 날짜 형식
        editRenderer: {
            type: 'CalendarRenderer',
            defaultFormat: 'yyyymmdd', // 달력 선택 시 데이터에 적용되는 날짜 형식
            showPlaceholder: true, // defaultFormat 설정된 값으로 플래스홀더 표시
            showEditorBtnOver: true, // 마우스 오버 시 에디터버튼 출력 여부
            showExtraDays: true, // 지난 달, 다음 달 여분의 날짜(days) 출력
            showTodayBtn: false, // 오늘 날짜 선택 버턴 출력
            showUncheckDateBtn: false, // 날짜 선택 해제 버턴 출력
            onlyCalendar: true,
            openDirectly: true, // 에디팅 진입 시 바로 달력 열기
        },
    },
    {
        dataField: 'applyPrcGbnCd',
        headerText: t('price.label.unitPriceStandard'), // 단가기준
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
        ) {
            let columnValue;
            COM170.value.forEach(function (code: any) {
                if (code.dtlCommCd === _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
        editable: false,
    },
    {
        dataField: 'curPrice',
        headerText: t('price.label.applyUnitPrice'), // 적용단가
        dataType: 'numeric',
        style: 'gridTextAlignRight',
        editRenderer: {
            type: 'InputEditRenderer',
            onlyNumeric: true, // 0~9만 입력가능
            allowPoint: false, // 소수점( . ) 도 허용할지 여부
            allowNegative: false, // 마이너스 부호(-) 허용 여부
            autoThousandSeparator: true, // 천단위 구분자 삽입 여부
        },
    },
    {
        dataField: 'purPrice',
        headerText: t('price.label.preUnitPrice'),
        dataType: 'numeric',
        editable: false,
        style: 'gridTextAlignRight',
    }, // 이전단가
    {
        dataField: 'originCd',
        headerText: t('com.label.origin'), // 원산지
        editable: false,
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
        ) {
            let columnValue;
            EAT300.value.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
    },
    {
        dataField: 'spec',
        headerText: t('com.label.spec'), // 규격
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
        ) {
            let columnValue;
            GLB600.value.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
        editable: false,
    },
    {
        dataField: 'itemRating',
        headerText: t('com.label.grade'), // 등급
        labelFunction: function (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
        ) {
            let columnValue;
            EAT400.value.forEach(function (code: any) {
                if (code.dtlCommCd == _value) {
                    columnValue = code.dtlCommNm;
                }
            });
            return columnValue;
        },
        editable: false,
    },
    {
        dataField: 'packingUnitQty',
        headerText: `${t('com.label.purchaseOrder')}<br/>${t('item.label.unitQty')}`,
        editable: false,
        style: 'gridTextAlignRight',
    }, // 발주<br/>단위수량 단위 수량 없음
    {
        dataField: 'lclsItemNm',
        headerText: t('item.label.lclsName'),
        editable: false,
        style: 'leftAlign',
    }, // 대분류명
    {
        dataField: 'mclsItemNm',
        headerText: t('item.label.mclsName'),
        editable: false,
        style: 'leftAlign',
    }, // 중분류명
    {
        dataField: 'sclsItemNm',
        headerText: t('item.label.sclsName'),
        editable: false,
        style: 'leftAlign',
    }, // 소분류명
    {
        dataField: 'useYn',
        headerText: t('com.label.useYn'), // 사용여부
        renderer: {
            // 셀 자체에 드랍다운리스트 출력하고자 할 때
            type: 'DropDownListRenderer',
            list: COM010,
            keyField: 'dtlCommCd',
            valueField: 'dtlCommNm',
            disabledFunction: function (
                _rowIndex: number,
                _columnIndex: number,
                _value: string,
                _item: any,
                _dataField: any,
            ) {
                // 행 아이템의 position 이 이사 라면 비활성화 처리
                if (itemFlag.value == false) {
                    return true;
                }
                return false;
            },
        },
    },
];

const columnLayout3 = [
    {
        dataField: 'applyStdDate',
        headerText: t('price.label.applyStartDate'), // 적용시작일자
        dataType: 'date',
        dateInputFormat: 'yyyymmdd', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd', // 그리드에 보여줄 날짜 형식
    },
    { dataField: 'itemCd', headerText: t('item.label.itemCode') }, // 품목코드
    {
        dataField: 'itemNm',
        headerText: t('item.label.itemName'),
        style: 'gridTextAlignLeft',
        width: '40%',
    }, // 품목명
    {
        dataField: 'applyUnitPrc',
        headerText: t('price.label.purchaseUnitPriceRateAndAmt'),
        dataType: 'numeric',
        style: 'gridTextAlignRight',
    }, // 매입단가(율/금액)
];

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

const popup_itmP01 = function () {
    if (addFlag.value == false) {
        // 조회 후 작업을 진행하여 주세요
        popupStore.alert(t('com.message.proceedAfterSearch'));
        return;
    }
    if (myGrid1.value?.getCheckedRowItemsAll().length == 0) {
        // 그룹 선택 후 진행해주세요
        popupStore.alert(t('com.message.proceedAfterSelect', [t('com.label.group')]));
        return;
    }
    const addedCount = myGrid1.value?.getAddedRowItems()?.length ?? 0;
    const editedCount = myGrid1.value?.getEditedRowItems()?.length ?? 0;

    if (addedCount > 0 || editedCount > 0) {
        popupStore.alert(t('com.message.saveCurrentRowFirst'));
        return;
    }

    popupStore.openPopup('biz', utils.biz.POPUP_COMPONENT.ITEM_POP, {
        userId: '',
        userNm: '',
        userTypeCd: '10',
        menuGrpCd: '',
        width: 600,
        height: 400,
        onOk: () => {
            callbackOk();
        },
        onCancel: () => {
            callbackCancel();
        },
    });
};

const callbackOk = function (param?: any) {
    const grid = myGrid2.value;
    searchParameter.value = param;

    const arr = [];
    for (let i = 0; i < param.length; i++) {
        const obj = {
            purchPrcGrpCd: purchGrpCd.value,
            itemCd: param[i].itemCd,
            itemNm: param[i].itemNm,
            curPrice: '',
            purPrice: '',
            applyPrcGbnCd: 'A',
            currentDate: '',
            taxFreeGbnCd: param[i].taxFreeGbnCd,
            originCd: param[i].originCd,
            spec: param[i].spec,
            itemRating: param[i].itemRating,
            packingUnitQty: param[i].packingUnitQty,
            lclsItemNm: param[i].lclsItemNm,
            mclsItemNm: param[i].mclsItemNm,
            sclsItemNm: param[i].sclsItemNm,
            useYn: 'Y',
        };
        arr.push(obj);
    }
    grid?.addRow(arr, 'first');

    grid?.setSelectionByIndex(0, 5);
    grid?.openInputer();

    callbackCancel();
};

const callbackCancel = function () {
    searchParameter.value = {
        itemCd: '',
        itemNm: '',
        lclsItemCd: '',
        mclsItemCd: '',
        sclsItemCd: '',
        itemTypeCd: '',
        selfThirdYn: '',
        invMngStdCd: '',
        tranStatCd: '',
        isMulti: true,
    };
};

const allCheckClick = () => {
    const grid = myGrid2.value;
    if (!grid) return;

    const uniqueValues = (grid.getColumnDistinctValues('currentDate') ?? []).filter(
        (item) => item >= today && item !== '',
    );

    if (!allChecked) {
        grid.setCheckedRowsByValue('currentDate', uniqueValues);
    } else {
        grid.addUncheckedRowsByValue('currentDate', uniqueValues);
    }

    allChecked = !allChecked;
};

const search = (i?: any) => {
    const grid = myGrid1.value;
    const grid2 = myGrid2.value;
    const grid3 = myGrid3.value;

    selectPriceGroup()
        .then((res) => {
            // 그리드 데이터 삽입
            grid?.setGridData(res?.data?.result ?? []);
            grid?.setCheckedRowsByValue('purchPrcGrpCd', i);
            grid?.removeAjaxLoader();
        })
        .catch(() => {
            grid?.removeAjaxLoader();
        });
    grid2?.setGridData([]);
    grid3?.setGridData([]);
};

const groupNew = () => {
    const grid = myGrid1.value; // 대분류 그리드 연결
    if (!grid) return;
    const hasPending =
        (grid?.getAddedRowItems()?.length ?? 0) > 0 ||
        (myGrid2.value?.getAddedRowItems()?.length ?? 0) > 0 ||
        (myGrid2.value?.getEditedRowItems()?.length ?? 0) > 0 ||
        (myGrid2.value?.getRemovedItems()?.length ?? 0) > 0;

    if (hasPending) {
        popupStore.alert(t('com.message.saveCurrentRowFirst'));
        return;
    }
    const obj = {
        purchPrcGrpCd: '',
        purchPrcGrpNm: '',
        countItem: '0',
        check: 'Y',
        useYn: 'Y',
    };
    grid?.addRow(obj, 'first');
    grid?.setAllCheckedRows(false); //모든 선택을 해제
    grid?.addCheckedRowsByValue('check', 'Y'); // 새로 추가된 행을 체크
    grid?.setSelectionByIndex(0, 1);
    grid?.openInputer();
    myGrid2.value?.clearGridData();
    myGrid3.value?.clearGridData();
};

const gRowClick = (event: any) => {
    const grid = myGrid1.value;
    if (!grid) return;

    const rowId = event.rowIdValue;
    rowIdFg.value = rowId;

    if (grid.isCheckedRowById(rowId)) {
        return;
    }

    grpFlag.value =
        (myGrid2.value?.getAddedRowItems()?.length ?? 0) > 0 ||
        (myGrid2.value?.getEditedRowItems()?.length ?? 0) > 0 ||
        (myGrid2.value?.getRemovedItems()?.length ?? 0) > 0;

    const [selectedRow] = grid.getSelectedRows();
    if (!selectedRow) return;

    const flag = selectedRow.purchPrcGrpCd;
    purchGrpCd.value = flag;

    grid.setAllCheckedRows(false);
    grid.addCheckedRowsByValue('purchPrcGrpCd', flag);

    if (!grid.isAddedByRowIndex(event.rowIndex)) {
        searchDtl(flag);
    } else {
        myGrid2.value?.clearGridData();
    }
};

const searchDtl = (f: any) => {
    const grid = myGrid2.value;
    addFlag.value = true;
    myGrid3.value?.clearGridData();
    const params = { purchPrcGrpCd: f };
    grid?.showAjaxLoader();

    selectPriceItem(params)
        .then((res) => {
            // 그리드 데이터 삽입
            grid?.setGridData(res?.data?.result ?? []);
            grid?.removeAjaxLoader();
        })
        .catch(() => {
            grid?.removeAjaxLoader();
        });
};

const copyGroup = () => {
    const grid1 = myGrid1.value;
    const grid2 = myGrid2.value;

    if (!grid1 || !grid2) return;

    const hasGroupPending =
        (grid1.getAddedRowItems()?.length ?? 0) > 0 || (grid1.getEditedRowItems()?.length ?? 0) > 0;

    if (hasGroupPending) {
        // 작업중인 행을 저장해주세요
        popupStore.alert(t('com.message.saveCurrentRowFirst'));
        return;
    }

    const checkedRows = grid1.getCheckedRowItems();

    if ((checkedRows?.length ?? 0) === 0) {
        // 복사할 그룹을 선택해주세요
        popupStore.alert(t('com.message.selectItemE', [t('price.label.copyGroup')]));
        return;
    }

    const itemGridData = grid2.getGridData();

    if ((itemGridData?.length ?? 0) === 0) {
        // 복사할 품목이 없습니다.
        popupStore.alert(t('com.message.noDateTo', [t('com.label.copy')]));
        return;
    }

    if ((grid2.getEditedRowItems()?.length ?? 0) > 0) {
        // 작업중인 행을 저장해주세요
        popupStore.alert(t('com.message.saveCurrentRowFirst'));
        return;
    }

    const okCallback = async () => {
        const group = { ...checkedRows[0].item };
        group.purchPrcGrpNm = `${group.purchPrcGrpNm}_copy`;

        // 원본 데이터 변경 방지를 위해 복사
        const items = itemGridData.map((item: any) => ({ ...item }));

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tomorrowDate =
            `${tomorrow.getFullYear()}` +
            `${String(tomorrow.getMonth() + 1).padStart(2, '0')}` +
            `${String(tomorrow.getDate()).padStart(2, '0')}`;

        // 과거 적용일 수정
        items.forEach((item: any) => {
            dateFormatChange(item.currentDate);

            if (realCompare.value && realCompare.value <= new Date()) {
                item.currentDate = tomorrowDate;
            }
        });

        // 중복 제거 (itemCd + currentDate 기준)
        const uniqueItems = items.filter(
            (item: any, index: number, array: any[]) =>
                index ===
                array.findIndex(
                    (target: any) =>
                        target.itemCd === item.itemCd && target.currentDate === item.currentDate,
                ),
        );

        const saveParams = {
            group: [group],
            item: uniqueItems,
            userId: loginUser.userId,
        };

        try {
            const res = await copyPurchaseGroup(saveParams);

            // 복사되었습니다.
            popupStore.alert(t('com.message.copied'));

            search(res?.data?.result);
            searchDtl(res?.data?.result);

            grpFlag.value = true;
            itemFlag.value = true;
        } catch (e: any) {
            popupStore.alert(e.message);
        }
    };

    // 복사하시겠습니까?
    popupStore.confirm(t('com.message.confirmCopy'), undefined, {
        onOk: okCallback,
    });
};

const dateFormatChange = (d: any) => {
    const beforeCompareDate = d;
    const year = beforeCompareDate.substr(0, 4);
    const month = beforeCompareDate.substr(4, 2);
    const day = beforeCompareDate.substr(6, 2);
    const compareDate = year + '-' + month + '-' + day;
    realCompare.value = new Date(compareDate);
};

const checkDate1 = (event: any) => {
    dateFormatChange(event.item.currentDate);
    if (dayjs(realCompare.value).format('YYYYMMDD') < today && event.item.currentDate != '') {
        // 과거 날짜는 수정 불가합니다
        popupStore.alert(t('com.message.cannotModifyPastDates', [t('com.label.update')]));
        return;
    }
};
const remove = () => {
    const grid = myGrid2.value;
    if (!grid) return;

    const checkedRow = grid.getCheckedRowItems() ?? [];

    if (!addFlag.value) {
        popupStore.alert(t('com.message.proceedAfterSearch'));
        return;
    }

    const hasPending =
        (myGrid1.value?.getAddedRowItems()?.length ?? 0) > 0 ||
        (myGrid1.value?.getEditedRowItems()?.length ?? 0) > 0;

    if (hasPending) {
        popupStore.alert(t('com.message.saveCurrentRowFirst'));
        return;
    }

    if (checkedRow.length === 0) {
        popupStore.alert(t('com.message.noDataSelected'));
        return;
    }

    const compareDate = realCompare.value;
    if (!compareDate) return;

    let addedRowCount = 0;

    for (let i = 0; i < checkedRow.length; i++) {
        const row = checkedRow[i];

        dateFormatChange(row.item.currentDate);

        const isPast = dayjs(compareDate).format('YYYYMMDD') < today && row.item.currentDate !== '';

        if (isPast) {
            popupStore.alert(t('com.message.cannotModifyPastDates', [t('com.label.del')]));
            return;
        }

        if (grid.isAddedByRowIndex(row.rowIndex)) {
            addedRowCount++;
        }
    }

    grpFlag.value = checkedRow.length === addedRowCount;

    myGrid1.value?.update();
    grid.removeCheckedRows();
};

const checkBox = (e: any) => {
    const grid = myGrid1.value;
    if (!grid) return;

    const flag = e.item.purchPrcGrpCd;
    const checkedCount = grid.getCheckedRowItems()?.length ?? 0;

    const hasPending =
        (myGrid2.value?.getAddedRowItems()?.length ?? 0) > 0 ||
        (myGrid2.value?.getEditedRowItems()?.length ?? 0) > 0 ||
        (myGrid2.value?.getRemovedItems()?.length ?? 0) > 0;

    // 1. 체크 ON
    if (e.checked) {
        if (checkedCount <= 1) {
            grid.addCheckedRowsByValue('purchPrcGrpCd', flag);
        } else {
            if (hasPending) {
                grpFlag.value = true;
            }

            grid.setAllCheckedRows(false);
            grid.addCheckedRowsByValue('purchPrcGrpCd', flag);
        }

        // 상세 조회
        if (!grid.isAddedByRowIndex(e.rowIndex)) {
            searchDtl(flag);
        } else {
            myGrid2.value?.clearGridData();
        }

        return;
    }

    // 2. 체크 OFF
    myGrid2.value?.clearGridData();
};

const batchCheck = () => {
    const grid = myGrid2.value;
    const grid1 = myGrid1.value;

    if (!grid || !grid1) return;

    const checkedRow = grid.getCheckedRowItems() ?? [];
    const gridData = grid.getGridData() ?? [];

    const batchDate = dayjs(pickedDate.value).format('YYYYMMDD');

    // 1. 기본 validation
    if ((grid1.getCheckedRowItems()?.length ?? 0) === 0) {
        popupStore.alert(t('com.message.proceedAfterSearch'));
        return;
    }

    if (
        (grid1.getAddedRowItems()?.length ?? 0) > 0 ||
        (grid1.getEditedRowItems()?.length ?? 0) > 0
    ) {
        popupStore.alert(t('com.message.saveCurrentRowFirst'));
        return;
    }

    if (checkedRow.length === 0) {
        popupStore.alert(t('com.message.noDataSelected'));
        return;
    }

    if (+amountPrice.value.replace(/,/g, '') > 100000000) {
        popupStore.alert(t('price.message.invalidValue'));
        return;
    }

    // 2. 중복 itemCd 체크 (선택 내)
    const hasDuplicateInSelection = checkedRow.some((v, i) =>
        checkedRow.some((v2, j) => i !== j && v.item?.itemCd === v2.item?.itemCd),
    );

    if (hasDuplicateInSelection) {
        popupStore.alert(t('price.message.batchUpdateNotAllowedForDuplicateItems'));
        return;
    }

    // 3. 기존 데이터 중복 체크
    const hasDuplicateInGrid = gridData.some((val: any) =>
        checkedRow.some((sel) => val.itemCd === sel.item?.itemCd && val.currentDate === batchDate),
    );

    if (hasDuplicateInGrid) {
        popupStore.alert(t('price.message.duplicateItemCodeOnModifiedDate'));
        return;
    }

    // 4. 실행
    batchItem(checkedRow, batchDate);
};

const batchItem = (checkedRow: any[], batchDate: string) => {
    const grid2 = myGrid2.value;
    const grid1 = myGrid1.value;

    if (!grid2 || !grid1) return;

    const price = Number(amountPrice.value?.replace(/,/g, '') ?? 0);
    const curPrice = Math.round(price / 10) * 10;

    checkedRow.forEach((row) => {
        const updatedItem = {
            ...row.item,
            curPrice,
            currentDate: batchDate,
        };

        // ✅ 안전한 단건 업데이트 방식
        grid2.updateRow(row.rowIndex, updatedItem);
    });

    grpFlag.value = false;

    // 헤더 그리드 갱신
    grid1.update();
};

const iRowClick = () => {
    const grid = myGrid2.value;
    const grid3 = myGrid3.value;

    if (!grid || !grid3) return;

    const selectRow = grid.getSelectedRows() ?? [];

    if (selectRow.length === 0) return;

    const row = selectRow[0];

    const groupFlag = row.purchPrcGrpCd;
    const itemFlag = row.itemCd;

    const params = {
        purchPrcGrpCd: groupFlag,
        itemCd: itemFlag,
    };

    grid3.showAjaxLoader();

    selectPriceItemLog(params)
        .then((res) => {
            grid3.setGridData(res?.data?.result ?? []);
        })
        .catch(() => {
            // 필요 시 alert 추가
        })
        .finally(() => {
            grid3.removeAjaxLoader();
        });
};

const validateBeforeSubmit1 = async () => {
    const checkItems = [
        { name: t('price.label.unitPriceGroupName'), required: true, value: 'purchPrcGrpNm' }, // 단가그룹명
    ];

    // biz 공통 유효성 함수 호출
    const result = await utils.validator.validateGridData(myGrid1.value, checkItems, t);

    // 결과 처리
    if (!result) {
        validationCheck.value = false;
        return false;
    }

    validationCheck.value = true;
    return true;
};

const validateBeforeSubmit2 = async () => {
    const checkItems = [
        { name: t('price.label.applyDate'), required: true, value: 'currentDate' }, // 적용일자
        {
            name: t('price.label.applyUnitPrice'),
            required: true,
            value: 'curPrice',
            decimal: true,
            maxValue: 9999999999,
        }, // 적용단가
    ];

    // biz 공통 유효성 함수 호출
    const result = await utils.validator.validateGridData(myGrid2.value, checkItems, t);

    // 결과 처리
    if (!result) {
        validationCheck.value = false;
        return false;
    }

    validationCheck.value = true;
    return true;
};

const checkUsable = async (event: any) => {
    if (event.dataField !== 'purchPrcGrpNm') return;

    const params = { purchPrcGrpCd: event.item.purchPrcGrpCd };

    try {
        const res = await checkUsableGrp(params);
        const resultList = res?.data?.result ?? [];

        if (resultList?.length > 0) {
            popupStore.alert(
                t('com.message.alreadyUseCust', [
                    resultList.map((v: any) => `${v.custNm}(${v.custCd})`).join(', <br/>'),
                ]),
            );

            myGrid1.value?.setCellValue(event.rowIndex, event.columnIndex, event.oldValue);
        }
    } catch (e: any) {
        popupStore.alert(e.message);
    }
};

const save = async () => {
    const userId = loginUser.userId;

    const grid1 = myGrid1.value;
    const grid2 = myGrid2.value;

    if (!grid1 || !grid2) return;

    const insertData1 = grid1.getAddedRowItems() ?? [];
    const updateData1 = grid1.getEditedRowItems() ?? [];

    const count1 = insertData1.length + updateData1.length;

    const checkedRows = grid1.getCheckedRowItemsAll() ?? [];
    const purchPrcGrpCd = checkedRows[0]?.purchPrcGrpCd ?? null;

    const insertData2 =
        grid2.getAddedRowItems()?.map((v) => ({
            ...v,
            purchPrcGrpCd,
        })) ?? [];

    const updateData2 =
        grid2.getEditedRowItems()?.map((v) => ({
            ...v,
            purchPrcGrpCd,
        })) ?? [];

    const deleteData2 =
        grid2.getRemovedItems()?.map((v) => ({
            ...v,
            purchPrcGrpCd,
            applyStdDate: v.currentDate,
        })) ?? [];

    const count2 = insertData2.length + updateData2.length + deleteData2.length;

    const saveData1 = {
        insert: insertData1,
        update: updateData1,
        userId,
    };

    const saveData2 = {
        insert: insertData2,
        update: updateData2,
        delete: deleteData2,
        userId,
    };

    let saveParams: any;

    if (count1 > 0 && count2 === 0) {
        saveParams = saveData1;

        for (const row of [...saveData1.insert, ...saveData1.update]) {
            purchPrcGrpNm.value = row.purchPrcGrpNm;

            const ok = await validateBeforeSubmit1();
            if (!ok) return;
        }
    } else if (count1 === 0 && count2 > 0) {
        saveParams = saveData2;

        for (const row of [...saveData2.insert, ...saveData2.update]) {
            currentDate.value = row.currentDate;
            curPrice.value = row.curPrice;

            const ok = await validateBeforeSubmit2();
            if (!ok) return;
        }
    } else {
        popupStore.alert(t('com.message.noDataToSave'));
        return;
    }

    // 복사하시겠습니까?
    popupStore.confirm(t('com.message.confirmSave'), undefined, {
        onOk: async () => {
            try {
                const purchGrpCd = purchPrcGrpCd;

                const api = count1 > 0 ? saveGroupList : saveItemList;

                const res = await api(saveParams);

                popupStore.alert(t('com.message.itemProcessed', [res?.data?.result]));

                if (!purchGrpCd) {
                    search();
                    grid2.clearGridData();
                    myGrid3.value?.clearGridData();
                } else {
                    search(purchGrpCd);
                    searchDtl(purchGrpCd);
                }

                grpFlag.value = true;
                itemFlag.value = true;
            } catch (e: any) {
                popupStore.alert(e.message);
            }
        },
    });
};

const addRow1 = () => {
    itemFlag.value = false;
    myGrid2.value?.update();
};

const addRow2 = () => {
    grpFlag.value = false;
    myGrid1.value?.update();
};

const createUpdateObject = (item: any, propertyName: any, propertyValue: any) => {
    let updatedObject = { ...item };
    updatedObject[propertyName] = propertyValue;
    return updatedObject;
};

const editValid2 = (event: any) => {
    const grid1 = myGrid1.value;
    const grid2 = myGrid2.value;

    if (!grid2) return;

    // 적용일자
    if (event.headerText === t('price.label.applyDate')) {
        dateFormatChange(event.value);

        if (
            realCompare.value &&
            dayjs(realCompare.value).format('YYYYMMDD') < today &&
            event.value !== ''
        ) {
            // 과거일자로 변경 불가합니다
            popupStore.alert(t('price.message.cannotChangeToPastDate'));

            grid2.updateRow(
                createUpdateObject(event.item, event.dataField, event.oldValue),
                event.rowIndex,
            );

            grid2.openEditDownListLayer();
            return;
        }

        const duplicated =
            event.type === 'cellEditEnd' &&
            (grid2.getGridData() ?? []).some(
                (val: any, idx: number) =>
                    event.rowIndex !== idx &&
                    val.itemCd === event.item.itemCd &&
                    val.currentDate === event.item.currentDate,
            );

        if (duplicated) {
            grid2.restoreEditedCells([[event.rowIndex, 'currentDate']]);

            // 같은 품목코드가 수정한 날짜에 존재합니다
            popupStore.alert(t('price.message.duplicateItemCodeOnModifiedDate'));

            grid2.updateRow(
                createUpdateObject(event.item, event.dataField, event.oldValue),
                event.rowIndex,
            );

            grid2.openEditDownListLayer();
            return;
        }
    }

    // 상태
    if (event.headerText === t('com.label.status')) {
        grpFlag.value = (grid2.getEditedRowItems()?.length ?? 0) === 0;

        if ((grid2.getAddedRowItems()?.length ?? 0) > 0) {
            grpFlag.value = false;
        }
    }

    grid1?.update();
};

const editValid1 = () => {
    const grid1 = myGrid1.value;

    if (!grid1) return;

    const editedCount = grid1.getEditedRowItems()?.length ?? 0;
    const addedCount = grid1.getAddedRowItems()?.length ?? 0;

    if (editedCount === 0) {
        itemFlag.value = true;
    } else {
        // 디테일 그리드에서 드롭다운 edit했을 때
        itemFlag.value = false;
    }

    if (addedCount > 0) {
        itemFlag.value = false;
    }

    myGrid2.value?.update();
};

const undoDisable1 = (event: any) => {
    const grid = myGrid1.value;

    if (!grid) return;

    const editedCount = grid.getEditedRowItems()?.length ?? 0;
    const addedCount = grid.getAddedRowItems()?.length ?? 0;

    if (event.marker === 'edited') {
        itemFlag.value = !(editedCount > 1 || addedCount > 0);
    }

    if (event.marker === 'added') {
        itemFlag.value = !(editedCount > 0 || addedCount > 1);
    }

    myGrid2.value?.update();
};

const undoDisable2 = (event: any) => {
    const grid = myGrid2.value;

    if (!grid) return;

    const editedCount = grid.getEditedRowItems()?.length ?? 0;
    const addedCount = grid.getAddedRowItems()?.length ?? 0;
    const removedCount = grid.getRemovedItems()?.length ?? 0;

    switch (event.marker) {
        case 'edited':
            grpFlag.value = !(editedCount > 1 || addedCount > 0 || removedCount > 0);
            break;

        case 'added':
            grpFlag.value = !(editedCount > 0 || addedCount > 1 || removedCount > 0);
            break;

        case 'removed':
            grpFlag.value = !(editedCount > 0 || addedCount > 0 || removedCount > 1);
            break;
    }

    myGrid1.value?.update();
};

const filterNonNumetic = () => {
    const input = amountPrice.value ?? '';

    // 숫자만 추출(선행 0 제거)
    const numeric = input.replace(/^0+|[^0-9]/g, '');

    const amount = Number(numeric);

    amountPrice.value = Number.isNaN(amount) ? '0' : amount.toLocaleString();

    if (amount >= 100000000) {
        // 숫자 범위가 유효하지 않습니다
        popupStore.alert(t('com.message.invalidRange', [t('price.label.numericRange')]));
        amountPrice.value = '';
    }
};

/**
 * 엑셀양식 다운로드 함수
 * @author LJY
 * @date 2025.03.19
 */
const excelSampleDown = () => {
    exportGrid.value?.exportToXlsx(false, {
        fileName: 'sample',
    });
};

/**
 * 엑셀양식 업로드 함수
 * @author LJY
 * @date 2025.03.19
 */
const excelSampleUpload = async () => {
    const { popupPromise } = popupStore.openPopup('biz', 'UI_PRC_P01', {
        width: 600,
        height: 400,
        param: {}, // 👈 이거 추가
    });

    const result = await popupPromise;

    if (result) {
        fnExcelUploadDownload(result);
    }
};

/**
 * 엑셀양식 업로드 저장
 * @author LJY
 * @date 2025.03.28
 */
const fnExcelUploadDownload = (param?: any) => {
    const params = {
        insert: param,
    };
    saveExcelItemList(params)
        .then((res) => {
            // {0} 건 처리 되었습니다
            popupStore.alert(t('com.message.itemProcessed', [res?.data?.result]));
            search();
            myGrid2.value?.clearGridData();
            myGrid3.value?.clearGridData();
            return;
        })
        .catch((e) => {
            return e;
        });
};

// =====================================================================================================
// HOOK 영역
// =====================================================================================================

// 페이지가 로드되기 전에 전체 데이터 출력
onMounted(() => {
    search();
    myGrid2.value?.clearGridData();
    myGrid3.value?.clearGridData();
});
</script>

<template>
    <!-- 메뉴&공통버튼영역 -->
    <!-- 엑셀양식다운, 엑셀양식업로드, 초기화, 저장  -->
    <MenuTop
        :menu-info="$props.menuInfo"
        :methods="{ excelSampleDown, excelSampleUpload, search, save }"
    />

    <MenuContent>
        <div class="halfDiv2">
            <div>
                <div class="subTitle">
                    <!-- 매입단가그룹 -->
                    <h3>{{ t('customer.label.purchaseUnitPriceGroup') }}</h3>
                    <div class="subBtnWrap">
                        <!-- 신규 -->
                        <ComButton :text="t('com.label.new')" @click="groupNew" />
                        <!-- 복사 -->
                        <ComButton :text="t('com.label.copy')" @click="copyGroup" />
                    </div>
                </div>
                <!--  S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGrid1"
                        :column-layout="columnLayout1"
                        :grid-props="gridProps1"
                        @cell-click="gRowClick"
                        @row-state-cell-click="undoDisable1"
                        @row-check-click="checkBox"
                        @cell-edit-end-before="checkUsable"
                        @add-row="addRow1"
                        @cell-edit-end="editValid1"
                    />
                </div>
                <!--  E : AUI Grid -->
            </div>
            <div>
                <div class="subTitle">
                    <!-- 품목 -->
                    <h3>{{ t('com.label.item') }}</h3>
                    <div class="subBtnWrap">
                        <!-- 일괄반영 -->
                        <ComButton :text="t('logistics.label.batchApply')" @click="batchCheck" />
                        <!-- 품목추가 -->
                        <ComButton :text="t('item.label.itemAdd')" @click="popup_itmP01" />
                        <!-- 삭제 -->
                        <ComButton :text="t('com.label.del')" @click="remove" />
                    </div>
                </div>

                <SearchArea>
                    <li>
                        <!-- 적용일자 -->
                        <div class="search_container">
                            <ComDateSelect
                                v-model="pickedDate"
                                :label="t('price.label.applyDate')"
                            />
                            <!-- :weekStartsOn="0" :disabled-dates="{ predicate: isBeforeToday }" inputFormat="yyyy-MM-dd" :startingViewDate="pickedDate" -->
                        </div>
                    </li>
                    <li>
                        <!-- 단가기준(금액) -->
                        <div class="search_container">
                            <ComInputbox
                                v-model="amountPrice"
                                :label="t('price.label.unitPriceStandardAmt')"
                                :maxlength="10"
                                @input="filterNonNumetic"
                            />
                        </div>
                    </li>
                </SearchArea>

                <!--  S : AUI Grid -->
                <div id="auiGrid" class="mb20">
                    <AUIGrid
                        ref="myGrid2"
                        :column-layout="columnLayout2"
                        :grid-props="gridProps2"
                        @cell-click="iRowClick"
                        @row-state-cell-click="undoDisable2"
                        @cell-edit-begin="checkDate1"
                        @add-row="addRow2"
                        @cell-edit-end="editValid2"
                        @row-all-chk-click="allCheckClick"
                    />
                </div>
                <!--  E : AUI Grid -->
                <div class="subTitle">
                    <!-- 품목 로그 -->
                    <h3>{{ t('item.label.itemLog') }}</h3>
                </div>
                <!--  S : AUI Grid -->
                <div id="auiGrid">
                    <AUIGrid
                        ref="myGrid3"
                        :column-layout="columnLayout3"
                        :grid-props="gridProps3"
                    />
                </div>
                <!--  E : AUI Grid -->

                <div style="display: none">
                    <AUIGrid
                        ref="exportGrid"
                        :grid-props="exportGirdProps"
                        :column-layout="exportGridLayout"
                    />
                </div>
            </div>
        </div>
    </MenuContent>
</template>

<style scoped>
.leftAlign {
    text-align: left;
}

.rightAlign {
    text-align: right;
}
</style>
