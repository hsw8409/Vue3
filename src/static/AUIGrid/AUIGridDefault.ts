/*
 * @file     AUIGridDefault.ts
 * @menu     AUI 그리드 default tㅓㄹ정
 * @author   astems
 * @since    2026-07-02
 * @version  1.0
 */

import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import i18n from '@/i18n';

// 1. AUIGrid가 가질 수 있는 Props 타입 선언 (필요한 속성 지속 추가 가능)
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
