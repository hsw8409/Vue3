/*
 * @file     AUIGridDefault.ts
 * @menu     AUI 그리드 default tㅓㄹ정
 * @author   astems
 * @since    2026-07-02
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import i18n from '@/i18n';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================
export interface GridProps {
    noDataMessage?: string;
    headerHeight?: number;
    rowHeight?: number;
    height?: number | string;
    useContextMenu?: boolean;
    enableRowCheckShiftKey?: boolean;
    contextMenuItems?: Array<{
        label: string;
        callback: (event: any) => void;
    }>;
    enableUndoRedo?: boolean;
    enableMovingColumn?: boolean;
    enableFilter?: boolean;
    editable?: boolean;
    rowIdField?: string;
    showStateColumn?: boolean;
    showRowCheckColumn?: boolean;
    rowIdTrustMode?: boolean;
    showRowNumColumn?: boolean;
    wrapSelectionMove?: boolean;
    softRemovePolicy?: string;
    editingOnKeyDown?: boolean;
    enableClipboard?: boolean;
    [key: string]: any; // 그 외 동적 속성 허용
}

/**
 * AUIGrid 핵심 타입 정의
 * @template T 그리드 데이터의 인터페이스를 제네릭으로 전달하여 사용
 */
export interface AUIGridProps<T = any> {
    // --- 데이터 제어 ---
    setGridData: (data: T[]) => void;
    getGridData: () => T[];
    appendData: (data: T[]) => void;
    addRow: (item: T, rowPosition?: 'first' | 'last' | number) => void;
    removeRow: (rowIndex: 'checked' | number) => void;
    clearGridData: () => void;
    updateRow: (item: T, rowIndex: number) => void;
    updateRows: (item: T[], rowIndexes: number, isMarkEdited?: boolean) => void;
    update: () => void;
    addUncheckedRowsByValue: (
        dataField: string,
        value: string | number | boolean | Array<string | number>,
    ) => void;
    addCheckedRowsByValue: (dataField: string, value: string | number | boolean) => void;
    isAddedByRowIndex: (rowIndex: number) => boolean;
    getAddedRowItems: () => T[];
    getEditedRowItems: () => T[];
    getRemovedItems: () => T[];
    getColumnValues: (dataField: string, total?: boolean) => any[];
    getCellValue: (rowIndex: number, dataField: string) => any;
    getColumnDistinctValues: (dataField: string, total?: boolean) => string[];
    isCheckedRowById: (rowId: string) => boolean;
    setCellValue: (rowIndex: number, dataField: string, value: any) => void;

    // --- 선택 및 체크 관리 ---
    getCheckedRowItems: () => T[];
    getCheckedRowIndices: () => number[];
    setAllCheckedRows: (checked: boolean) => void;
    getSelectedItems: () => any[];
    getSelectedRows: () => T[];
    getCheckedRowItemsAll: () => T[];
    getSelectedIndex: () => number;
    removeCheckedRows: () => void;
    setSelectionByIndex: (rowIndex: number, columnIndex: number) => void;
    setSelectionBlock: (
        startRowIndex: number,
        endRowIndex: number,
        startColumnIndex: number,
        endColumnIndex: number,
    ) => void;
    clearSelection: () => void;
    setRowPosition: (rowPosition: number) => void;
    setCheckedRowsByValue: (dataField: string, value: unknown) => void;
    rowIdToIndex: (rowId: string) => number;
    openEditDownListLayer: () => void;
    restoreEditedCells: (cells: any[]) => void;

    // --- 레이아웃 및 설정 ---
    setColumnLayout: (columnLayout: any[]) => void;
    resize: (width?: number | string, height?: number | string) => void;

    // --- 정렬, 필터, 검색 ---
    sortingByFields: (sortFields: { dataField: string; sortType: 1 | -1 }[]) => void;
    clearFilter: () => void;
    clearSorting: () => void;
    searchStart: (term: string, fields: string[]) => void;

    // --- 상태 관리 ---
    getRowCount: () => number;
    showColumn: (dataField: string) => void;
    hideColumn: (dataField: string) => void;

    // --- 기타 ---
    destroy: () => void;
    refresh: () => void;
    showAjaxLoader: () => void;
    removeAjaxLoader: () => void;
    openInputer: () => void;
    exportToXlsx: (exportWithStyle: boolean, props?: any) => void;
}

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const AUIGridDefault = {
    // 기본 값 생성 함수
    getDefaultGridProps(): GridProps {
        const AUIGrid = (window as any).AUIGrid;

        return {
            noDataMessage: i18n.global.t('com.message.noDataFound'),
            headerHeight: 33,
            rowHeight: 30,
            height: 600,
            useContextMenu: true,
            enableRowCheckShiftKey: true,
            contextMenuItems: [
                {
                    label: '현재 값으로 필터링',
                    callback: function (event) {
                        var dataField = event.dataField;
                        var value = event.value;

                        AUIGrid.setFilterByValues(event.pid, dataField, value);
                    },
                },
                {
                    label: '모든 필터 해제',
                    callback: function (event) {
                        // 위에서 선언한 AUIGrid를 그대로 사용합니다.
                        AUIGrid.clearFilterAll(event.pid);
                    },
                },
                {
                    label: '엑셀로 저장하기',
                    callback: (event: any) => {
                        AUIGrid.exportToXlsx(event.pid);
                    },
                },
            ],
            enableUndoRedo: false,
            enableMovingColumn: true, // 컬럼 이동 기능
            enableFilter: true, // 필터 기능
            enableClipboard: true, // 복사 기능
            showFilterIconOnHeader: true, // 헤더 필터 적용
        };
    },

    // 빌더 인스턴스 생성기
    gridPropsBuilder() {
        const props = this.getDefaultGridProps();

        return {
            withNoDataMessage(noDataMessage?: string) {
                if (noDataMessage) props.noDataMessage = noDataMessage;
                return this;
            },
            withHeaderHeight(headerHeight?: number) {
                if (headerHeight) props.headerHeight = headerHeight;
                return this;
            },
            withRowHeight(rowHeight?: number) {
                if (rowHeight) props.rowHeight = rowHeight;
                return this;
            },
            withEditable(editable?: boolean) {
                if (editable !== undefined) props.editable = editable;
                return this;
            },
            withRowIdField(rowIdField?: string) {
                if (rowIdField) props.rowIdField = rowIdField;
                return this;
            },
            withShowStateColumn(showStateColumn?: boolean) {
                if (showStateColumn !== undefined) props.showStateColumn = showStateColumn;
                return this;
            },
            withShowRowCheckColumn(showRowCheckColumn?: boolean) {
                if (showRowCheckColumn !== undefined) props.showRowCheckColumn = showRowCheckColumn;
                return this;
            },
            withRowIdTrustMode(rowIdTrustMode?: boolean) {
                if (rowIdTrustMode !== undefined) props.rowIdTrustMode = rowIdTrustMode;
                return this;
            },
            withShowRowNumColumn(showRowNumColumn?: boolean) {
                if (showRowNumColumn !== undefined) props.showRowNumColumn = showRowNumColumn;
                return this;
            },
            withWrapSelectionMove(wrapSelectionMove?: boolean) {
                if (wrapSelectionMove !== undefined) props.wrapSelectionMove = wrapSelectionMove;
                return this;
            },
            withSoftRemovePolicy(softRemovePolicy?: string) {
                if (softRemovePolicy) props.softRemovePolicy = softRemovePolicy;
                return this;
            },
            withEditingOnKeyDown(editingOnKeyDown?: boolean) {
                if (editingOnKeyDown !== undefined) props.editingOnKeyDown = editingOnKeyDown;
                return this;
            },
            withExtraProps(extraProps?: Record<string, any>) {
                if (extraProps) {
                    Object.assign(props, extraProps);
                }
                return this;
            },
            build(): GridProps {
                return props;
            },
        };
    },
};

// 원본 컴포넌트 프로토타입에 기본값 주입
(AUIGrid as any).defaultProps = AUIGridDefault.getDefaultGridProps();

export { AUIGridDefault };
