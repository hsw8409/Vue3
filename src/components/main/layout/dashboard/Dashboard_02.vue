<script setup lang="ts">
/*
 * @file     Dashboard_02.vue
 * @menu     대시보드02
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 */
// =====================================================================================================
// import 영역
// =====================================================================================================
import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps, AUIGridProps } from '@/static/AUIGrid/AUIGridDefault';
import { onMounted, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useI18n } from 'vue-i18n'; // 다국어

import { selectDashboard02Data } from '@/api/dashboard'; // backend
// =====================================================================================================
// Type 선언
// =====================================================================================================
interface MonthlyDataRow {
    month: string | number;
    preYearPurchQty?: string | number;
    curYearPurchQty?: string | number;
    preYearSaleQty?: string | number;
    curYearSaleQty?: string | number;
}

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const { t } = useI18n();
const dateBeforeCnt = 30;

// ==================================================
// 차트 설정 영역
// ==================================================
const chartProps0 = ref({
    type: 'radialBar' as const,
    series: [0],
    height: 350,
    options: {
        labels: [t('dashboard.label.goalRate')],
        colors: ['#1692FE'],
        plotOptions: {
            radialBar: {
                width: '100px',
                height: '100px',
                track: { background: '#6ABBFE' },
                dataLabels: {
                    name: { show: false, fontSize: '29px' },
                    value: { fontSize: '50px' },
                },
            },
        },
    },
});

const chartProps1 = ref({
    type: 'line' as const,
    height: 350,
    series: [
        { name: t('dashboard.label.prevYear'), type: 'column', data: [] as number[] },
        { name: t('dashboard.label.nowYear'), type: 'column', data: [] as number[] },
        { name: t('dashboard.label.increaseRate'), type: 'line', data: [] as Array<number | null> },
    ],
    options: {
        stroke: { width: [0, 0, 3] },
        colors: ['#1B84CC', '#B21917', '#F6B933'],
        legend: { position: 'right' as const },
        plotOptions: { bar: { columnWidth: '50%' } },
        xaxis: { categories: Array.from({ length: 12 }, (_, i) => t('com.label.month', [i + 1])) },
        yaxis: [
            {
                seriesName: t('dashboard.label.prevYear'),
                axisTicks: { show: true },
                axisBorder: { show: true },
                title: { text: t('dashboard.label.inboundQty') },
            },
            { seriesName: t('dashboard.label.prevYear'), show: false },
            {
                opposite: true,
                seriesName: t('dashboard.label.increaseRate'),
                axisTicks: { show: true },
                axisBorder: { show: true },
                title: { text: t('dashboard.label.increaseRate') },
            },
        ],
        tooltip: {
            y: {
                formatter: function (value: number, { seriesIndex, w }: any) {
                    if (seriesIndex === 2) return value + ' %';
                    const seriesName = w.config.series[seriesIndex].name;
                    if (seriesName.includes('수량') || seriesName.includes('Qty'))
                        return value + ' 개';
                    return value >= 1000 ? (value / 1000).toFixed(2) + ' 톤' : value + ' kg';
                },
            },
        },
    },
});

const chartProps2 = ref({
    type: 'line' as const,
    height: 350,
    series: [
        { name: t('dashboard.label.prevYear'), type: 'column', data: [] as number[] },
        { name: t('dashboard.label.nowYear'), type: 'column', data: [] as number[] },
        { name: t('dashboard.label.increaseRate'), type: 'line', data: [] as Array<number | null> },
    ],
    options: {
        stroke: { width: [0, 0, 3] },
        colors: ['#1B84CC', '#B21917', '#F6B933'],
        legend: { position: 'right' as const },
        plotOptions: { bar: { columnWidth: '50%' } },
        xaxis: { categories: Array.from({ length: 12 }, (_, i) => t('com.label.month', [i + 1])) },
        yaxis: [
            {
                seriesName: t('dashboard.label.prevYear'),
                axisTicks: { show: true },
                axisBorder: { show: true },
                title: { text: t('dashboard.label.outboundQty') },
            },
            { seriesName: t('dashboard.label.prevYear'), show: false },
            {
                opposite: true,
                seriesName: t('dashboard.label.increaseRate'),
                axisTicks: { show: true },
                axisBorder: { show: true },
                title: { text: t('dashboard.label.increaseRate') },
            },
        ],
        tooltip: {
            y: {
                formatter: function (value: number, { seriesIndex, w }: any) {
                    if (seriesIndex === 2) return value + ' %';
                    const seriesName = w.config.series[seriesIndex].name;
                    if (seriesName.includes('수량') || seriesName.includes('Qty'))
                        return value + ' 개';
                    return value >= 1000 ? (value / 1000).toFixed(2) + ' 톤' : value + ' kg';
                },
            },
        },
    },
});

// ==================================================
// 그리드 레이아웃 및 프로퍼티 설정 영역
// ==================================================
const myGrid0 = ref<AUIGridProps | null>(null);
const myGrid1 = ref<AUIGridProps | null>(null);
const myGrid2 = ref<AUIGridProps | null>(null);

const columnLayout0 = [
    { dataField: 'custCd', headerText: t('customer.label.custCode') },
    {
        dataField: 'custNm',
        headerText: t('customer.label.custName'),
        width: '40%',
        style: 'gridTextAlignLeft',
    },
    {
        dataField: 'inPlanDate',
        headerText: t('dashboard.label.outboundPlanDate'),
        width: 100,
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            if (!_value || _value.length < 8) return _value;
            return _item._$isGroupSumField
                ? '계'
                : `${_value.substring(0, 4)}-${_value.substring(4, 6)}-${_value.substring(6, 8)}`;
        },
    },
    {
        dataField: 'ordQty',
        headerText: t('logistics.label.orderQty'),
        style: 'gridTextAlignRight',
        dataType: 'numeric',
    },
    {
        dataField: 'qty',
        headerText: t('logistics.label.outboundQty'),
        style: 'gridTextAlignRight',
        dataType: 'numeric',
    },
    {
        dataField: 'amt',
        headerText: t('aggregration.label.outboundWeight'),
        style: 'gridTextAlignRight',
        dataType: 'numeric',
        formatString: '#,##0.00',
    },
];

const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: 230,
        useGroupingPanel: false,
        enableFilter: true,
        groupingFields: ['inPlanDate'],
        groupingSummary: { dataFields: ['ordQty', 'qty', 'amt'] },
        fillValueGroupingSummary: false,
        adjustSummaryPosition: true,
        displayTreeOpen: true,
        enableCellMerge: false,
        cellMergeRowSpan: false,
        showBranchOnGrouping: false,
        rowStyleFunction: function (_rowIndex: number, _item: any) {
            return _item?._$isGroupSumField && _item._$depth === 2 ? 'sum_column' : null;
        },
    })
    .build();

const gridProps2: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        height: 230,
        useGroupingPanel: false,
        enableFilter: false,
        groupingSummary: { dataFields: ['cnt'] },
        fillValueGroupingSummary: false,
        adjustSummaryPosition: false,
        displayTreeOpen: true,
        enableCellMerge: false,
        cellMergeRowSpan: false,
        showBranchOnGrouping: false,
        rowStyleFunction: function (_rowIndex: number, _item: any) {
            return _item?._$isGroupSumField && _item._$depth === 2 ? 'sum_column' : null;
        },
    })
    .build();

const columnLayout1 = [
    { dataField: 'custCd', headerText: t('customer.label.custCode') },
    {
        dataField: 'custNm',
        headerText: t('device.label.manufacturer'),
        width: '40%',
        style: 'gridTextAlignLeft',
    },
    {
        dataField: 'inPlanDate',
        headerText: t('dashboard.label.inboundPlanDate'),
        width: 100,
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            if (!_value || _value.length < 8) return _value;
            return _item._$isGroupSumField
                ? '계'
                : `${_value.substring(0, 4)}-${_value.substring(4, 6)}-${_value.substring(6, 8)}`;
        },
    },
    {
        dataField: 'ordQty',
        headerText: t('logistics.label.orderQty'),
        style: 'gridTextAlignRight',
        dataType: 'numeric',
    },
    {
        dataField: 'qty',
        headerText: t('analysis.label.inboundQty'),
        style: 'gridTextAlignRight',
        dataType: 'numeric',
    },
    {
        dataField: 'amt',
        headerText: t('logistics.label.inboundWeight'),
        style: 'gridTextAlignRight',
        dataType: 'numeric',
        formatString: '#,##0.00',
    },
];

const columnLayout2 = [
    {
        dataField: 'prodReqDate',
        headerText: t('request.label.instructionDate'),
        width: 90,
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            if (!_value || _value.length < 8) return '';
            return `${_value.slice(0, 4)}-${_value.slice(4, 6)}-${_value.slice(6, 8)}`;
        },
    },
    {
        dataField: 'itemNm',
        headerText: t('request.label.productionItem'),
        style: 'gridTextAlignLeft',
    },
    {
        dataField: 'sellerCustNm',
        headerText: t('com.label.salesCust'),
        style: 'gridTextAlignLeft',
        width: 120,
    },
    {
        dataField: 'processTypeCd',
        headerText: t('request.label.instructionType'),
        width: 130,
    },
    {
        dataField: 'cnt',
        headerText: `${t('com.label.item')}<br/>${t('com.label.qty')}`,
        width: 45,
        style: 'gridTextAlignRight',
        dataType: 'numeric',
        formatString: '#,##0',
    },
    {
        dataField: 'procStatFg',
        headerText: t('dashboard.label.progressState'),
        width: 80,
    },
];

// 💡 [핵심] 비동기 데이터 보관함 및 그리드 빌드 상태 보관함
const rawResultData = ref<any>(null);
const gridInitialized = ref({ grid0: false, grid1: false, grid2: false });

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getCalculatedDate = (daysToAdd: number): string => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    return formatDate(baseDate);
};

const dayInfo = ref({
    thiryDaysBefore: getCalculatedDate(-dateBeforeCnt),
    today: formatDate(new Date()),
    tomorrow: getCalculatedDate(1),
    week: getCalculatedDate(6),
});

const chartNumChange = (num: number): number => {
    return isNaN(num) || num === Infinity || num === -Infinity ? 0 : num;
};

function buildMonthlySeries(data: MonthlyDataRow[]) {
    const preYearPurch = new Array(12).fill(0);
    const curYearPurch = new Array(12).fill(0);
    const purchRate = new Array(12).fill(null);
    const preYearSale = new Array(12).fill(0);
    const curYearSale = new Array(12).fill(0);
    const saleRate = new Array(12).fill(null);

    if (Array.isArray(data)) {
        data.forEach((row) => {
            const idx = Number(row.month) - 1;
            if (idx < 0 || idx > 11) return;

            const preP = Number(row.preYearPurchQty || 0);
            const curP = Number(row.curYearPurchQty || 0);
            const preS = Number(row.preYearSaleQty || 0);
            const curS = Number(row.curYearSaleQty || 0);

            preYearPurch[idx] = preP;
            curYearPurch[idx] = curP;
            preYearSale[idx] = preS;
            curYearSale[idx] = curS;

            purchRate[idx] = preP === 0 ? null : Math.round(((curP - preP) * 100) / preP);
            saleRate[idx] = preS === 0 ? null : Math.round(((curS - preS) * 100) / preS);
        });
    }
    return { preYearPurch, curYearPurch, purchRate, preYearSale, curYearSale, saleRate };
}

// 💡 [핵심 비즈니스 로직] 데이터 안전 바인딩 함수
const tryBindGridData = () => {
    // API 데이터가 아직 안 왔거나, 그리드 3개 중 하나라도 라이브러리 로드가 안 끝났으면 실행 거부(Return)
    if (!rawResultData.value) return;
    if (
        !gridInitialized.value.grid0 ||
        !gridInitialized.value.grid1 ||
        !gridInitialized.value.grid2
    )
        return;

    // 네 가지 조건이 완전히 결합된 순간에만 안전하게 바인딩 실행 (완벽하게 destroy 에러 회피)
    if (myGrid0.value?.setGridData)
        myGrid0.value.setGridData(rawResultData.value.outcomingDto || []);
    if (myGrid1.value?.setGridData)
        myGrid1.value.setGridData(rawResultData.value.incomingDto || []);
    if (myGrid2.value?.setGridData)
        myGrid2.value.setGridData(rawResultData.value.producingDto || []);
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
onMounted(() => {
    selectDashboard02Data()
        .then((res: any) => {
            const d = res?.result;
            if (!d) return;

            // 1. 가져온 데이터를 우선 글로벌 상태 저장소에 세팅
            rawResultData.value = d;

            // 2. 혹시 이미 그리드들이 ready 상태를 끝마치고 대기 중이었다면 데이터 주입 시도
            tryBindGridData();

            // 3. 차트 컴포넌트는 타이밍 이슈를 타지 않으므로 즉시 렌더링
            const rawRate = d.goalSaleWtQty ? (d.curYearSaleWtQty * 100) / d.goalSaleWtQty : 0;
            chartProps0.value.series = [chartNumChange(Number(rawRate.toFixed(2)))];

            const monthly = buildMonthlySeries(d.dashboardGridDto || []);
            chartProps1.value.series = [
                { name: t('dashboard.label.prevYear'), type: 'column', data: monthly.preYearPurch },
                { name: t('dashboard.label.nowYear'), type: 'column', data: monthly.curYearPurch },
                { name: t('dashboard.label.increaseRate'), type: 'line', data: monthly.purchRate },
            ];
            chartProps2.value.series = [
                { name: t('dashboard.label.prevYear'), type: 'column', data: monthly.preYearSale },
                { name: t('dashboard.label.nowYear'), type: 'column', data: monthly.curYearSale },
                { name: t('dashboard.label.increaseRate'), type: 'line', data: monthly.saleRate },
            ];
        })
        .catch((e: Error) => console.error(e));
});
</script>

<template>
    <div id="container_dashboard">
        <div class="halfDiv">
            <div>
                <div>
                    <h3>{{ t('dashboard.label.outboundRate') }}</h3>
                    <VueApexCharts
                        :type="chartProps0.type"
                        :options="chartProps0.options"
                        :series="chartProps0.series"
                        :height="chartProps0.height"
                        width="350"
                    />
                </div>
                <div>
                    <h3>{{ t('com.label.inbound') }}</h3>
                    <VueApexCharts
                        :type="chartProps1.type"
                        :options="chartProps1.options"
                        :series="chartProps1.series"
                        :height="chartProps1.height"
                    />
                    <h3>{{ t('com.label.outbound') }}</h3>
                    <VueApexCharts
                        :type="chartProps2.type"
                        :options="chartProps2.options"
                        :series="chartProps2.series"
                        :height="chartProps2.height"
                    />
                </div>
            </div>

            <div>
                <div>
                    <div class="subTitle">
                        <h3>
                            {{ t('dashboard.label.outboundInfo') }} ({{ dayInfo.today }} ~
                            {{ dayInfo.tomorrow }})
                        </h3>
                    </div>
                    <div class="dashboard-grid-box">
                        <AUIGrid
                            ref="myGrid0"
                            :column-layout="columnLayout0"
                            :grid-props="gridProps"
                        />
                    </div>
                </div>

                <div class="mt10">
                    <div class="subTitle">
                        <h3>
                            {{ t('dashboard.label.inboundInfo') }} ({{ dayInfo.today }} ~
                            {{ dayInfo.week }})
                        </h3>
                    </div>
                    <div class="dashboard-grid-box">
                        <AUIGrid
                            ref="myGrid1"
                            :column-layout="columnLayout1"
                            :grid-props="gridProps"
                        />
                    </div>
                </div>

                <div class="mt10">
                    <div class="subTitle">
                        <h3>
                            {{
                                t('dashboard.label.productionInfoIncludeIncomplete', [
                                    dateBeforeCnt,
                                ])
                            }}
                        </h3>
                    </div>
                    <div class="dashboard-grid-box">
                        <AUIGrid
                            ref="myGrid2"
                            :column-layout="columnLayout2"
                            :grid-props="gridProps2"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.sum_column {
    background-color: rgba(106, 187, 254, 0.4) !important;
}

.subTitle {
    display: flex;
    align-items: center;
    height: 30px !important;
}
</style>
