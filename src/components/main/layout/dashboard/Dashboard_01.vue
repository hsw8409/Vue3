<!--
 * @file     /components/main/layout/dashboard/Dashboard_01.vue
 * @menu     대시보드01
 * @author   hsw
 * @since    2025-10-14
 * @version  1.0
 * 
 * @description 
 * 최초 생성
 * 
-->
<script setup>
// ==================================================
// import 영역
// ==================================================
import AUIGrid from '@/static/AUIGrid-Vue.js/AUIGrid.vue';
import { AUIGridDefault } from '@/common/utils/AUIGridDefault';
import { onMounted, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useI18n } from 'vue-i18n'; // 다국어

import { selectDashboard01Data } from '@/api/dashboard'; //backend
import TokenService from '@/common/service/token';

// ==================================================
// 변수 선언 영역
// ==================================================
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
    type: 'radialBar',
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

// 그리드 객체
const myGrid = ref(null);
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
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) => {
            return addComma(value);
        },
    }, // 전년출고수량
    {
        dataField: 'preYearSaleWtQty',
        headerText: t('dashboard.label.prevYearOutboundWeight'),
        style: 'gridTextAlignRight',
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) => {
            return addComma(value);
        },
    }, // 전년출고중량
    {
        dataField: 'curYearSaleQty',
        headerText: t('dashboard.label.nowYearOutboundQty'),
        style: 'gridTextAlignRight',
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) => {
            return addComma(value);
        },
    }, // 당해출고수량
    {
        dataField: 'curYearSaleWtQty',
        headerText: t('dashboard.label.nowYearOutboundWeight'),
        style: 'gridTextAlignRight',
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) => {
            return addComma(value);
        },
    }, // 당해출고중량
    {
        dataField: 'qtyVariation',
        headerText: t('dashboard.label.outboundIncrease'),
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) => {
            let columnData;
            columnData = Math.round(
                ((item.curYearSaleQty - item.preYearSaleQty) / item.preYearSaleQty) * 100,
            );
            if (isNaN(columnData)) {
                columnData = 0;
            } else if (columnData == Infinity) {
                columnData = 100;
            }
            columnData += '%';
            return columnData;
        },
    }, // 출고량증감
    {
        dataField: 'preYearSaleAmt',
        headerText: t('dashboard.label.prevYearSaleAmt'),
        style: 'gridTextAlignRight',
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) => {
            return addComma(value);
        },
    }, // 전년매출액
    {
        dataField: 'curYearSaleAmt',
        headerText: t('dashboard.label.nowYearSaleAmt'),
        style: 'gridTextAlignRight',
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) => {
            return addComma(value);
        },
    }, // 당해매출액
    {
        dataField: 'atmVariation',
        headerText: t('dashboard.label.saleAmtIncrease'),
        labelFunction: (rowIndex, columnIndex, value, headerText, item, dataField, cItem) => {
            let columnData;
            columnData = Math.round(
                ((item.curYearSaleAmt - item.preYearSaleAmt) / item.preYearSaleAmt) * 100,
            );
            if (isNaN(columnData)) {
                columnData = 0;
            } else if (columnData == Infinity) {
                columnData = 100;
            }
            columnData += '%';
            return columnData;
        },
    }, // 매출액증감
];

// 그리드 속성 정의
const gridProps = AUIGridDefault.gridPropsBuilder()
    .withExtraProps({
        showFooter: true,
        height: 420,
        rowStyleFunction: function (rowIndex, item) {
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
        expFunction: (columnValues) => {
            const gridData = myGrid.value.getGridData();
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
        expFunction: (columnValues) => {
            const gridData = myGrid.value.getGridData();
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
        expFunction: (columnValues) => {
            const gridData = myGrid.value.getGridData();
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
        expFunction: (columnValues) => {
            const gridData = myGrid.value.getGridData();
            return gridData
                .filter((v) => v.month.includes('분기'))
                .reduce((sum, curr) => {
                    const wt = Number(curr.curYearSaleAmt) || 0;
                    return sum + wt;
                }, 0);
        },
    }, //당해매출액
];

const toNum = (v) => (typeof v === 'number' ? v : Number(String(v ?? 0).replace(/,/g, '')));

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

//숫자 콤마 적용
function addComma(num) {
    return Number(num).toLocaleString();
}
//NaN, Infinity 처리
function numChange(num) {
    if (isNaN(num)) {
        num = 0;
    } else if (num == Infinity) {
        num = 100;
    }
    return num;
}
function chartNumChange(num) {
    if (isNaN(num)) {
        num = 0;
    } else if (num == Infinity) {
        num = 0;
    }
    return num;
}
// ==================================================
// HOOK 영역
// ==================================================

onMounted(() => {
    selectDashboard01Data()
        .then((res) => {
            dashboardData.value = res?.result;
            myGrid.value.setGridData(dashboardData.value.dashboardGridDto);
            return res;
        })
        .then((res) => {
            stockInAmt.value = res.result.stockInAmt;

            const sale = toNum(dashboardData.value.curYearSaleAmt);
            const purch = toNum(dashboardData.value.curYearPurchAmt);
            const stock = toNum(stockInAmt.value);

            const grossPct = sale ? ((sale - purch + stock) * 100) / sale : 0;

            chartProps.value.series[0] = chartNumChange(Number(grossPct.toFixed(2))); // 소수 2자리표시
        })
        .catch((e) => {
            console.log(e.message);
        });
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
