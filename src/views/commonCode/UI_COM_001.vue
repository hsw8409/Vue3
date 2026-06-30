<script setup lang="ts">
/*
 * @file     UI_COM_001.vue
 * @menu     공통코드관리
 * @author   astems
 * @since    2026-06-25
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n'; // 다국어

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps } from '@/static/AUIGrid/AUIGridDefault';

import { useLayoutStore } from '@/common/stores/layout'; // 레이아웃 store
import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import SearchArea from '@/components/menu/SearchArea.vue'; // 조회조건 영역
import { utils } from '@/common/utils';
import { usePopupStore } from '@/common/stores/popup';

import ComButton from '@/components/form/ComButton.vue';
import ComInputbox from '@/components/form/ComInputbox.vue'; // 텍스트 box

import { selectGroupList, selectDetailList, saveComCode } from '@/api/commonCode'; //backend
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

// 사용여부 공통코드화 필요.
const COM010 = JSON.parse(localStorage.getItem('COM010') ?? '{}');

// 검색 조건
const searchBoxState = {
    commCd: '',
};
const searchBox = reactive({ ...searchBoxState });

const popup = usePopupStore();

// ==================================================
// 그리드 영역
// ==================================================
const myGrid1 = ref<any>(null);
const myGrid2 = ref<any>(null);

const gridProps: GridProps = ref(
    AUIGridDefault.gridPropsBuilder()
        .withExtraProps({
            editable: true,
            showStateColumn: true,
            showRowNumColumn: true, // 줄번호 칼럼 렌더러 출력
            showRowCheckColumn: true, // 체크박스 표시 설정
            height: 280,
            rowIdField: '_$uid',
            selectionMode: 'singleRow',
            enableFilter: true,
            enableRowSelector: true,
        })
        .build(),
);

//그리드 높이 계산
const layoutStore = useLayoutStore();
const gridResizeHeight = layoutStore.layoutHeight - utils.biz.MENU_LAYOUT.S_ST_G_STM; // 메인 화면 높이에서 그리드를 제외한 영역을 빼줘야 함...

const gridProps2 = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        editable: true,
        showStateColumn: true,
        showRowNumColumn: true, // 줄번호 칼럼 렌더러 출력
        showRowCheckColumn: true, // 체크박스 표시 설정
        height: gridResizeHeight,
        rowIdField: '_$uid',
        selectionMode: 'singleRow',
        enableFilter: true,
        enableRowSelector: true,
    })
    .build();

// 공통코드
const columnLayout1 = [
    { dataField: 'commCd', headerText: t('com.label.code'), filter: { showIcon: true } }, // 코드
    {
        dataField: 'commNm',
        headerText: t('com.label.codeName'),
        style: 'gridTextAlignLeft',
        width: 200,
        filter: { showIcon: true },
    }, //명칭
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
                item: any,
                _dataField: any,
            ) {
                // 행 아이템의 name 이 Anna 라면 드랍다운리스트 비활성화(disabled) 처리
                if (item.ref10Nm === 'N') {
                    return true;
                }
                return false;
            },
        },
    },
    {
        dataField: 'ref01Nm',
        headerText: t('commonCode.label.refName1'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조1명칭
    {
        dataField: 'ref02Nm',
        headerText: t('commonCode.label.refName2'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조2명칭
    {
        dataField: 'ref03Nm',
        headerText: t('commonCode.label.refName3'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조3명칭
    {
        dataField: 'ref04Nm',
        headerText: t('commonCode.label.refName4'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조4명칭
    {
        dataField: 'ref05Nm',
        headerText: t('commonCode.label.refName5'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조5명칭
    {
        dataField: 'ref06Nm',
        headerText: t('commonCode.label.refName6'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조6명칭
    {
        dataField: 'ref07Nm',
        headerText: t('commonCode.label.refName7'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조7명칭
    {
        dataField: 'ref08Nm',
        headerText: t('commonCode.label.refName8'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조8명칭
    {
        dataField: 'ref09Nm',
        headerText: t('commonCode.label.refName9'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조9명칭
    {
        dataField: 'ref10Nm',
        headerText: t('commonCode.label.refName10'),
        style: 'gridTextAlignLeft',
        width: 150,
        visible: false,
    }, // 참조10명칭
    {
        dataField: 'updId',
        headerText: t('com.label.updUser'),
        width: 120,
        style: 'gridTextAlignLeft',
        editable: false,
    }, // 수정자
    {
        dataField: 'updDtime',
        headerText: t('com.label.updDtm'),
        width: 140,
        editable: false,
        dataType: 'date',
        dateInputFormat: 'yyyymmdd HHMMss', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd HH:MM:ss', // 그리드에 보여줄 날짜 형식
    }, // 수정일시
];

// 공통코드 상세
const columnLayout2 = [
    {
        dataField: 'dtlCommCd',
        headerText: t('commonCode.label.detailCode'),
        width: 90,
        filter: { showIcon: true },
    }, // 상세코드
    {
        dataField: 'dtlCommNm',
        headerText: t('commonCode.label.detailName'),
        style: 'gridTextAlignLeft',
        width: 150,
        filter: { showIcon: true },
    }, // 상세명칭
    {
        dataField: 'orderBySeq',
        headerText: t('com.label.sortSeq'),
        style: 'gridTextAlignRight',
        filter: { showIcon: true },
        editRenderer: {
            type: 'Number',
            onlyNumeric: true, // 0~9만 입력가능
            maxlength: 4,
            textAlign: 'right', // 오른쪽 정렬로 입력되도록 설정
            autoThousandSeparator: false, // 천단위 구분자 삽입 여부
        },
    }, // 정렬순서
    {
        dataField: 'useYn',
        headerText: t('com.label.useYn'),
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
                item: any,
                _dataField: any,
            ) {
                // 1. 상세 항목의 참조값 확인
                const isDetailLocked = item.dtlRef10Nm === 'N';

                // 2. 부모 그리드(myGrid1)의 선택된 행의 참조값 확인
                // 옵셔널 체이닝(?.)을 사용하여 안전하게 접근
                const selectedMainRow = myGrid1.value?.getSelectedRows()?.[0];
                const isGroupLocked = selectedMainRow?.ref10Nm === 'N';

                return isDetailLocked || isGroupLocked;
            },
        },
    }, // 사용여부
    { dataField: 'dtlRef01Cd', headerText: t('commonCode.label.refCode1'), width: 90 }, // 참조1코드
    {
        dataField: 'dtlRef01Nm',
        headerText: t('commonCode.label.refName1'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조1명칭
    { dataField: 'dtlRef02Cd', headerText: t('commonCode.label.refCode2'), width: 90 }, // 참조2코드
    {
        dataField: 'dtlRef02Nm',
        headerText: t('commonCode.label.refName2'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조2명칭
    { dataField: 'dtlRef03Cd', headerText: t('commonCode.label.refCode3'), width: 90 }, // 참조3코드
    {
        dataField: 'dtlRef03Nm',
        headerText: t('commonCode.label.refName3'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조3명칭
    { dataField: 'dtlRef04Cd', headerText: t('commonCode.label.refCode4'), width: 90 }, // 참조4코드
    {
        dataField: 'dtlRef04Nm',
        headerText: t('commonCode.label.refName4'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조4명칭
    { dataField: 'dtlRef05Cd', headerText: t('commonCode.label.refCode5'), width: 90 }, // 참조5코드
    {
        dataField: 'dtlRef05Nm',
        headerText: t('commonCode.label.refName5'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조5명칭
    { dataField: 'dtlRef06Cd', headerText: t('commonCode.label.refCode6'), width: 90 }, // 참조6코드
    {
        dataField: 'dtlRef06Nm',
        headerText: t('commonCode.label.refName6'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조6명칭
    { dataField: 'dtlRef07Cd', headerText: t('commonCode.label.refCode7'), width: 90 }, // 참조7코드
    {
        dataField: 'dtlRef07Nm',
        headerText: t('commonCode.label.refName7'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조7명칭
    { dataField: 'dtlRef08Cd', headerText: t('commonCode.label.refCode8'), width: 90 }, // 참조8코드
    {
        dataField: 'dtlRef08Nm',
        headerText: t('commonCode.label.refName8'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조8명칭
    { dataField: 'dtlRef09Cd', headerText: t('commonCode.label.refCode9'), width: 90 }, // 참조9코드
    {
        dataField: 'dtlRef09Nm',
        headerText: t('commonCode.label.refName9'),
        style: 'gridTextAlignLeft',
        width: 150,
    }, // 참조9명칭
    // { dataField: "dtlRef10Cd", headerText: t('commonCode.label.refCode10'), width: 90 }, // 참조10코드
    {
        dataField: 'dtlRef10Nm',
        headerText: t('commonCode.label.refName10'),
        style: 'gridTextAlignLeft',
        width: 150,
        visible: false,
    }, // 참조10명칭
    {
        dataField: 'updId',
        headerText: t('com.label.updUser'),
        width: 120,
        style: 'gridTextAlignLeft',
        editable: false,
    }, // 수정자
    {
        dataField: 'updDtime',
        headerText: t('com.label.updDtm'),
        width: 140,
        editable: false,
        dataType: 'date',
        dateInputFormat: 'yyyymmdd HHMMss', // 데이터의 날짜 형식
        formatString: 'yyyy-mm-dd HH:MM:ss', // 그리드에 보여줄 날짜 형식
    }, // 수정일시
];

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

// 조회조건 초기화
const reset = () => {
    Object.assign(searchBox, searchBoxState);
    search();
};

// 공통코드 조회
const search = () => {
    selectGroupList(searchBox)
        .then((res) => {
            myGrid1.value.setGridData(res?.data?.result);
            myGrid2.value.clearGridData();
        })
        .catch((e) => {
            return popup.alert(e.message);
        });
};

// 공통코드 상세 조회
const fnSearchDetail = () => {
    const param = { commCd: myGrid1.value.getSelectedRows()[0].commCd };
    selectDetailList(param)
        .then((res) => {
            myGrid2.value.setGridData(res?.data?.result);
            return;
        })
        .catch((e) => {
            return popup.alert(e.message);
        });
};

// 공통코드 그룹 행 추가
const fnAddedRowCheck = (e: any) => {
    if (myGrid1.value.getSelectedRows()[0].ref10Nm == 'N') {
        return false;
    }
    if (!myGrid1.value.isAddedByRowIndex(e.rowIndex) && e.dataField == 'commCd') {
        return false;
    }
};

// 공통코드 행 추가
const fnAddedRowCheck2 = (e: any) => {
    if (myGrid1.value.getSelectedRows()[0].ref10Nm == 'N') {
        return false;
    }
    if (myGrid2.value.getSelectedRows()[0].dtlRef10Nm == 'N') {
        return false;
    }
    if (!myGrid2.value.isAddedByRowIndex(e.rowIndex) && e.dataField == 'dtlCommCd') {
        return false;
    }
};

// 공통코드 행 추가
const fnAddMain = () => {
    const addRowItem = {
        commCd: '',
        commNm: '',
        ref01Nm: '',
        ref02Nm: '',
        ref03Nm: '',
        ref04Nm: '',
        ref05Nm: '',
        ref06Nm: '',
        ref07Nm: '',
        ref08Nm: '',
        ref09Nm: '',
        ref10Nm: 'Y',
        useYn: 'Y',
    };
    myGrid1.value.addRow(addRowItem, 'first');
};

// 공통코드 상세 행 추가
const fnAddDetail = () => {
    if (myGrid1.value.getSelectedRows().length == 0) {
        // 공통코드 그룹 정보를 선택해주세요.
        popup.alert(t('com.message.selectItemL', [t('commonCode.label.commonCodeGroupInfo')]));
        return false;
    }
    const rowIndex = myGrid1.value.getSelectedIndex();
    if (myGrid1.value.isAddedByRowIndex(rowIndex[0])) {
        // 공통코드 그룹 정보 먼저 등록 후에 신규 등록 가능합니다.
        popup.alert(
            t('com.message.registerRequiredBeforeNewL', [
                t('commonCode.label.commonCodeGroupInfo'),
            ]),
        );

        return false;
    }
    if (myGrid1.value.getSelectedRows()[0].ref10Nm == 'N') {
        // 해당 공통코드는 화면에서 수정할 권한이 없습니다.\n관리자에게 문의해주세요.
        popup.alert(t('com.message.noUpdatePermissionContactAdmin', [t('com.label.comCode')]));
        return false;
    }
    const addRowItem = {
        commCd: myGrid1.value.getSelectedRows()[0].commCd,
        dtlCommCd: '',
        dtlCommNm: '',
        dtlRef01Cd: '',
        dtlRef01Nm: '',
        dtlRef02Cd: '',
        dtlRef02Nm: '',
        dtlRef03Cd: '',
        dtlRef03Nm: '',
        dtlRef04Cd: '',
        dtlRef04Nm: '',
        dtlRef05Cd: '',
        dtlRef05Nm: '',
        dtlRef06Cd: '',
        dtlRef06Nm: '',
        dtlRef07Cd: '',
        dtlRef07Nm: '',
        dtlRef08Cd: '',
        dtlRef08Nm: '',
        dtlRef09Cd: '',
        dtlRef09Nm: '',
        dtlRef10Cd: '',
        dtlRef10Nm: 'Y',
        orderBySeq: '0',
        useYn: 'Y',
    };
    myGrid2.value.addRow(addRowItem, 'first');
};

// 공통코드 그룹 삭제
const fnDeleteMain = () => {
    if (myGrid1.value.getCheckedRowItemsAll().length == 0) {
        // 선택된 데이터가 없습니다.
        popup.alert(t('com.message.noDataSelected'));
        return false;
    }

    if (myGrid1.value.getCheckedRowItemsAll()[0].ref10Nm == 'N') {
        // 해당 공통코드는 화면에서 수정할 권한이 없습니다.\n관리자에게 문의해주세요.
        popup.alert(t('com.message.noUpdatePermissionContactAdmin', [t('com.label.comCode')]));
        return false;
    }
    myGrid1.value.removeCheckedRows();
};

// 공통코드 상세 삭제
const fnDeleteDetail = () => {
    if (myGrid1.value.getSelectedRows().length == 0) {
        // 공통코드 그룹 정보를 선택해주세요.
        popup.alert(t('com.message.selectItemL', [t('commonCode.label.commonCodeGroupInfo')]));
        return false;
    }

    if (myGrid1.value.getSelectedRows()[0].ref10Nm == 'N') {
        // 해당 공통코드는 화면에서 수정할 권한이 없습니다.\n관리자에게 문의해주세요.
        popup.alert(t('com.message.noUpdatePermissionContactAdmin', [t('com.label.comCode')]));
        return false;
    }

    if (myGrid2.value.getCheckedRowItemsAll().length == 0) {
        // 선택된 데이터가 없습니다.
        popup.alert(t('com.message.noDataSelected'));
        return false;
    }

    const filterEditableFalse = myGrid2.value
        .getCheckedRowItemsAll()
        .filter((data: any) => data.dtlRef10Nm == 'N');
    console.log(filterEditableFalse);
    if (filterEditableFalse.length > 0) {
        // 선택한 항목 중에 화면에서 수정할 권한이 없는 항목이 존재합니다.\n관리자에게 문의해주세요.
        popup.alert(t('com.message.noUpdatePermissionOnSelectedContactAdmin'));
        return false;
    }
    myGrid2.value.removeCheckedRows();
};

// 공통코드 저장
const save = async () => {
    const gridItems = [myGrid1.value, myGrid2.value];
    const result = utils.validator.checkGridChanges(gridItems);

    if (!result) {
        // 저장할 데이터가 없습니다.
        popup.alert(t('com.message.noDataToSave'));
        return false;
    }

    // 필수 체크
    // 공통코드 분류 - 코드, 명
    const checkItems = [
        { value: 'commCd', name: t('com.label.code'), required: true },
        { value: 'commNm', name: t('com.label.codeName'), required: true },
    ];

    const isValid = await utils.validator.validateGridData(myGrid1.value, checkItems, t);
    if (!isValid) {
        return;
    }

    // 공통코드 - 코드, 명
    const checkDetailItems = [
        { value: 'dtlCommCd', name: t('commonCode.label.detailCode'), required: true },
        { value: 'dtlCommNm', name: t('commonCode.label.detailCode'), required: true },
    ];

    const isDetailValid = await utils.validator.validateGridData(
        myGrid2.value,
        checkDetailItems,
        t,
    );
    if (!isDetailValid) {
        return;
    }

    const param = {
        insertGroup: myGrid1.value.getAddedRowItems(),
        updateGroup: myGrid1.value.getEditedRowItems(),
        deleteGroup: myGrid1.value.getRemovedItems(),
        insertDetail: myGrid2.value.getAddedRowItems(),
        updateDetail: myGrid2.value.getEditedRowItems(),
        deleteDetail: myGrid2.value.getRemovedItems(),
    };

    saveComCode(param)
        .then((res) => {
            // {0}건 처리되었습니다.
            popup.alert(t('com.message.itemProcessed', [res?.data?.result]));
            search();
            myGrid2.value.clearGridData();
        })
        .catch((e) => {
            return popup.alert(e.message);
        });
};

// ==================================================
// Hook 영역
// ==================================================
onMounted(() => {
    myGrid1.value.clearGridData();
    myGrid2.value.clearGridData();
    //초기 로드시 기본 조회
    search();
});
</script>
<template>
    <MenuTop ref="menuTopRef" :menu-info="$props.menuInfo" :methods="{ reset, search, save }" />

    <MenuContent>
        <SearchArea>
            <li>
                <div class="search_container">
                    <!-- 코드/명칭 -->
                    <ComInputbox
                        v-model="searchBox.commCd"
                        :label="t('com.label.codeAndName')"
                        maxlength="50"
                        @enter="search"
                    />
                </div>
            </li>
        </SearchArea>
        <div>
            <div class="subTitle">
                <!-- 공통코드 그룹 정보 -->
                <h3>{{ t('commonCode.label.commonCodeGroupInfo') }}</h3>
                <div class="subBtnWrap">
                    <!-- 신규 -->
                    <ComButton :params="{ name: t('com.label.new') }" @click="fnAddMain" />
                    <!-- 삭제 -->
                    <ComButton :params="{ name: t('com.label.del') }" @click="fnDeleteMain" />
                </div>
            </div>
            <!--  S : AUI Grid -->
            <div id="auiGrid">
                <AUIGrid
                    ref="myGrid1"
                    :column-layout="columnLayout1"
                    :grid-props="gridProps"
                    @cell-edit-begin="fnAddedRowCheck"
                    @selection-change="fnSearchDetail"
                />
            </div>
            <!--  E : AUI Grid -->
        </div>
        <div class="mt10">
            <div class="subTitle">
                <!-- 공통코드 상세 정보 -->
                <h3>{{ t('commonCode.label.commonCodeDetailInfo') }}</h3>
                <div class="subBtnWrap">
                    <!-- 신규 -->
                    <ComButton :params="{ name: t('com.label.new') }" @click="fnAddDetail" />
                    <!-- 삭제 -->
                    <ComButton :params="{ name: t('com.label.del') }" @click="fnDeleteDetail" />
                </div>
            </div>
            <!--  S : AUI Grid -->
            <div id="auiGrid">
                <AUIGrid
                    ref="myGrid2"
                    :column-layout="columnLayout2"
                    :grid-props="gridProps2"
                    @cell-edit-begin="fnAddedRowCheck2"
                />
            </div>
            <!--  E : AUI Grid -->
        </div>
    </MenuContent>
</template>
