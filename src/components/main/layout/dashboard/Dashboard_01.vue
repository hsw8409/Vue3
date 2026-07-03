<script setup lang="ts">
/*
 * @file     Dashboard_01.vue
 * @menu     대시보드02
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 */
// =====================================================================================================
// import 영역
// =====================================================================================================
import AUIGrid from '@/static/AUIGrid/AUIGrid.vue';
import { AUIGridDefault, type GridProps, type AUIGridProps } from '@/static/AUIGrid/AUIGridDefault';
import { onMounted, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useI18n } from 'vue-i18n'; // 다국어

import { selectDashboard01Data } from '@/api/dashboard'; //backend

// =====================================================================================================
// Type 선언
// =====================================================================================================

// =====================================================================================================
// 변수 선언
// =====================================================================================================
// 메세지 변수
const { t } = useI18n();

const stockInAmt = ref(0);

const dashboardData = ref({
    goalYear: '',
    goalSaleAmt: 0,
    goalSaleWtQty: 0,
    curYearPurchAmt: 0,
    curYearSaleAmt: 0,
    curYearSaleWtQty: 0,
    dashboardGridDto: {},
});

// ==================================================
// 차트 영역
// ==================================================
const chartProps = ref({
    type: 'radialBar' as const,
    series: [0],
    options: {
        labels: [t('dashboard.label.goalRate')], // 달성률
        colors: ['#1692FE'],
        plotOptions: {
            radialBar: {
                track: {
                    background: '#6ABBFE',
                },
                dataLabels: {
                    name: {
                        fontSize: '29px',
                        show: false,
                    },
                    value: {
                        fontSize: '48px',
                    },
                },
            },
        },
    },
});

// ==================================================
// 그리드 영역
// ==================================================

const myGrid = ref<AUIGridProps | null>(null);
const columnLayout = [
    {
        dataField: 'month',
        headerText: t('dashboard.label.performanceAnalysis'),
        width: '30%',
        style: 'gridTextAlignRight',
    }, // 실적분석
    {
        dataField: 'preYearSaleQty',
        headerText: t('dashboard.label.prevYearOutboundQty'),

        style: 'gridTextAlignRight',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            return addComma(_value);
        },
    }, // 전년출고수량
    {
        dataField: 'preYearSaleWtQty',
        headerText: t('dashboard.label.prevYearOutboundWeight'),
        style: 'gridTextAlignRight',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            return addComma(_value);
        },
    }, // 전년출고중량
    {
        dataField: 'curYearSaleQty',
        headerText: t('dashboard.label.nowYearOutboundQty'),
        style: 'gridTextAlignRight',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            return addComma(_value);
        },
    }, // 당해출고수량
    {
        dataField: 'curYearSaleWtQty',
        headerText: t('dashboard.label.nowYearOutboundWeight'),
        style: 'gridTextAlignRight',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            return addComma(_value);
        },
    }, // 당해출고중량
    {
        dataField: 'qtyVariation',
        headerText: t('dashboard.label.outboundIncrease'),
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            const rate = Math.round(
                ((Number(_item.curYearSaleQty) - Number(_item.preYearSaleQty)) /
                    Number(_item.preYearSaleQty)) *
                    100,
            );

            return `${!Number.isFinite(rate) ? 100 : rate}%`;
        },
    }, // 출고량증감
    {
        dataField: 'preYearSaleAmt',
        headerText: t('dashboard.label.prevYearSaleAmt'),
        style: 'gridTextAlignRight',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            return addComma(_value);
        },
    }, // 전년매출액
    {
        dataField: 'curYearSaleAmt',
        headerText: t('dashboard.label.nowYearSaleAmt'),
        style: 'gridTextAlignRight',
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            return addComma(_value);
        },
    }, // 당해매출액
    {
        dataField: 'atmVariation',
        headerText: t('dashboard.label.saleAmtIncrease'),
        labelFunction: (
            _rowIndex: number,
            _columnIndex: number,
            _value: string,
            _headerText: string,
            _item: any,
            _dataField: any,
            _cItem: any,
        ) => {
            const rate = Math.round(
                ((Number(_item.curYearSaleAmt) - Number(_item.preYearSaleAmt)) /
                    Number(_item.preYearSaleAmt)) *
                    100,
            );

            return `${!Number.isFinite(rate) ? 100 : rate}%`;
        },
    }, // 매출액증감
];

// 그리드 속성 정의
const gridProps: GridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        showFooter: true,
        height: 420,
        rowStyleFunction: function (_rowIndex: any, item: any) {
            if (
                item.month == '1 분기' ||
                item.month == '2 분기' ||
                item.month == '3 분기' ||
                item.month == '4 분기'
            ) {
                return 'sum_column';
            }
        },
    })
    .build();

const footerLayout = [
    {
        labelText: t('com.label.sum'),
        positionField: '#base',
        style: 'aui-grid-my-column',
    }, // 합계
    {
        dataField: 'curYearSaleQty',
        positionField: 'curYearSaleQty',
        operation: 'SUM',
        style: 'textRight',
        formatString: '#,##0',
        expFunction: () => {
            const gridData = myGrid.value?.getGridData() ?? [];

            return gridData
                .filter((v) => v.month.includes('분기'))
                .reduce((sum, curr) => {
                    const wt = Number(curr.curYearSaleQty) || 0;
                    return sum + wt;
                }, 0);
        },
    }, //출고수량
    {
        dataField: 'curYearSaleWtQty',
        positionField: 'curYearSaleWtQty',
        operation: 'SUM',
        style: 'textRight',
        formatString: '#,##0.00',
        expFunction: () => {
            const gridData = myGrid.value?.getGridData() ?? [];

            return gridData
                .filter((v) => v.month.includes('분기'))
                .reduce((sum, curr) => {
                    const wt = Number(curr.curYearSaleWtQty) || 0;
                    return sum + wt;
                }, 0);
        },
    }, //출고중량
    {
        dataField: 'preYearSaleAmt',
        positionField: 'preYearSaleAmt',
        operation: 'SUM',
        style: 'textRight',
        formatString: '#,##0',
        expFunction: () => {
            const gridData = myGrid.value?.getGridData() ?? [];

            return gridData
                .filter((v) => v.month.includes('분기'))
                .reduce((sum, curr) => {
                    const wt = Number(curr.preYearSaleAmt) || 0;
                    return sum + wt;
                }, 0);
        },
    }, //전년매출액
    {
        dataField: 'curYearSaleAmt',
        positionField: 'curYearSaleAmt',
        operation: 'SUM',
        style: 'textRight',
        formatString: '#,##0',
        expFunction: () => {
            const gridData = myGrid.value?.getGridData() ?? [];

            return gridData
                .filter((v) => v.month.includes('분기'))
                .reduce((sum, curr) => {
                    const wt = Number(curr.curYearSaleAmt) || 0;
                    return sum + wt;
                }, 0);
        },
    }, //당해매출액
];

const toNum = (v: any) => (typeof v === 'number' ? v : Number(String(v ?? 0).replace(/,/g, '')));

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

//숫자 콤마 적용
const addComma = (num: string | number | null | undefined): string =>
    Number(num ?? 0).toLocaleString();

//NaN, Infinity 처리
const numChange = (num: number): number => {
    if (Number.isNaN(num)) {
        return 0;
    }

    if (!Number.isFinite(num)) {
        return 100;
    }

    return num;
};
const chartNumChange = (num: number): number => {
    if (isNaN(num)) {
        num = 0;
    } else if (num === Infinity) {
        num = 0;
    }

    return num;
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
onMounted(async () => {
    try {
        const res: any = await selectDashboard01Data();

        dashboardData.value = res.result;

        myGrid.value?.setGridData(dashboardData.value.dashboardGridDto as any[]);

        stockInAmt.value = Number(res.result.stockInAmt) || 0;

        const sale = toNum(dashboardData.value.curYearSaleAmt);
        const purch = toNum(dashboardData.value.curYearPurchAmt);
        const stock = toNum(stockInAmt.value);

        const grossPct = sale > 0 ? ((sale - purch + stock) * 100) / sale : 0;

        chartProps.value.series[0] = chartNumChange(Number(grossPct.toFixed(2)));
    } catch (e) {
        console.error(e);
    }
});
</script>

<template>
    <div id="container_dashboard">
        <div class="halfDiv2">
            <div>
                <!-- 매출 총이익률 -->
                <h3>{{ t('dashboard.label.saleTotProfitRate') }}</h3>
                <VueApexCharts
                    width="480"
                    height="350"
                    :type="chartProps.type"
                    :options="chartProps.options"
                    :series="chartProps.series"
                />
            </div>
            <div>
                <table class="tableLayout" style="border-spacing: 20px">
                    <colgroup>
                        <col style="width: 30%" />
                        <col style="width: 5%" />
                        <col style="width: 30%" />
                        <col style="width: 5%" />
                        <col style="width: 30%" />
                    </colgroup>
                    <tbody>
                        <tr>
                            <!-- 당해년도 목표 매출액 -->
                            <td class="dashboard-title">
                                {{ t('dashboard.label.nowYearGoalSaleAmt') }}
                            </td>
                            <td class="blank-td"></td>
                            <!-- 당해년도 목표 출고량 -->
                            <td class="dashboard-title">
                                {{ t('dashboard.label.saleTotProfitRate') }}
                            </td>
                            <td class="blank-td"></td>
                            <!-- 당해년도 누적 매입액 -->
                            <td class="dashboard-title">
                                {{ t('dashboard.label.nowYearCumulativePurchaseAmt') }}
                            </td>
                        </tr>
                        <tr>
                            <td class="dashboard-number">
                                {{ addComma(dashboardData?.goalSaleAmt) }}
                            </td>
                            <td class="blank-td"></td>
                            <td class="dashboard-number">
                                {{ addComma(dashboardData?.goalSaleWtQty) }}
                            </td>
                            <td class="blank-td"></td>
                            <td class="dashboard-number">
                                {{ addComma(dashboardData?.curYearPurchAmt) }}
                            </td>
                        </tr>
                        <tr>
                            <!-- 당해년도 누적 매출액 -->
                            <td class="dashboard-title">
                                {{ t('dashboard.label.nowYearCumulativeSaleAmt') }}
                            </td>
                            <td class="blank-td"></td>
                            <!-- 당해년도 누적 출고중량 -->
                            <td class="dashboard-title">
                                {{ t('dashboard.label.nowYearCumulativeOutboundWeight') }}
                            </td>
                            <td class="blank-td"></td>
                            <!-- 당해년도 매출 총이익 -->
                            <td class="dashboard-title">
                                {{ t('dashboard.label.nowYearSaleAmtTotProfit') }}
                            </td>
                        </tr>
                        <tr>
                            <td class="dashboard-number">
                                {{ addComma(dashboardData?.curYearSaleAmt) }}
                            </td>
                            <td class="blank-td"></td>
                            <td class="dashboard-number">
                                {{ addComma(dashboardData?.curYearSaleWtQty) }}
                            </td>
                            <td class="blank-td"></td>
                            <td class="dashboard-number">
                                {{
                                    addComma(
                                        toNum(dashboardData?.curYearSaleAmt) -
                                            toNum(dashboardData?.curYearPurchAmt) +
                                            toNum(stockInAmt),
                                    )
                                }}
                            </td>
                            <!-- <td class="dashboard-number">{{ numChange(Math.round((dashboardData?.curYearSaleAmt - dashboardData?.curYearPurchAmt )*100 / dashboardData?.curYearSaleAmt)) }} %</td> -->
                        </tr>
                        <tr>
                            <!-- 매출 목표 달성율 -->
                            <td class="dashboard-title">{{ t('dashboard.label.saleGoalRate') }}</td>
                            <td class="blank-td"></td>
                            <!-- 출고 목표 달성율 -->
                            <td class="dashboard-title">{{ t('dashboard.label.outboundRate') }}</td>
                            <td class="blank-td"></td>
                            <!-- 당해년도 매출 원가율 -->
                            <td class="dashboard-title">
                                {{ t('dashboard.label.outboundSaleCostRate') }}
                            </td>
                        </tr>
                        <tr>
                            <td class="dashboard-number">
                                {{
                                    numChange(
                                        Math.round(
                                            (dashboardData?.curYearSaleAmt * 100) /
                                                dashboardData?.goalSaleAmt,
                                        ),
                                    )
                                }}
                                %
                            </td>
                            <td class="blank-td"></td>
                            <td class="dashboard-number">
                                {{
                                    numChange(
                                        Math.round(
                                            (dashboardData?.curYearSaleWtQty * 100) /
                                                dashboardData?.goalSaleWtQty,
                                        ),
                                    )
                                }}
                                %
                            </td>
                            <td class="blank-td"></td>
                            <td class="dashboard-number">
                                {{
                                    numChange(
                                        ((toNum(dashboardData?.curYearPurchAmt) -
                                            toNum(stockInAmt)) /
                                            toNum(dashboardData?.curYearSaleAmt)) *
                                            100,
                                    ).toFixed(2)
                                }}
                                %
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="mt10">
            <div class="subTitle">
                <!-- 실적 -->
                <h3>{{ t('com.label.performance') }}</h3>
            </div>
            <!--  S : AUI Grid -->
            <div id="auiGrid">
                <AUIGrid
                    ref="myGrid"
                    :column-layout="columnLayout"
                    :grid-props="gridProps"
                    :footer-layout="footerLayout"
                />
            </div>
            <!--  E : AUI Grid -->
        </div>
    </div>
</template>

<style>
.sum_column {
    background-color: rgba(106, 187, 254, 0.4) !important;
}
</style>
