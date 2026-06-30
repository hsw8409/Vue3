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
    [key: string]: any; // 그 외 동적 속성 허용
}

const AUIGridDefault = {
    // 기본 값 생성 함수
    getDefaultGridProps(): GridProps {
        return {
            noDataMessage: i18n.global.t('com.message.noDataFound'),
            headerHeight: 33,
            rowHeight: 30,
            height: 600,
            useContextMenu: true,
            enableRowCheckShiftKey: true,
            contextMenuItems: [
                {
                    label: '엑셀로 저장하기',
                    callback: (event: any) => {
                        const AUIGrid = (window as any).AUIGrid;

                        AUIGrid.exportToXlsx(event.pid);
                    },
                },
            ],
            enableUndoRedo: false,
            enableMovingColumn: true,
            enableFilter: true,
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
