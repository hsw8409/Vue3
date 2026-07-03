/*
 * @file     types/dashboard.d.ts
 * @menu     대시보드 타입 관련
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */
export interface DashboardProps {
    goalYear?: string;
    goalSaleAmt?: string;
    goalSaleWtQty?: string;
    curYearPurchAmt?: string;
    curYearSaleAmt?: string;
    curYearSaleWtQty?: string;
    dashboardGridDto?: DashboardGridProps;
    incomingDto?: InOutDataProps;
    outcomingDto?: InOutDataProps;
    producingDto?: CreateProductOrderProps;
}

export interface DashboardGridProps {
    month?: string;
    quarter?: string;
    preYearPurchQty?: string;
    preYearPurchAmt?: string;
    curYearPurchQty?: string;
    curYearPurchAmt?: string;
    preYearSaleQty?: string;
    preYearSaleWtQty?: string;
    preYearSaleAmt?: string;
    curYearSaleQty?: string;
    curYearSaleWtQty?: string;
    curYearSaleAmt?: string;
}
export interface InOutDataProps {
    custCd?: string;
    custNm?: string;
    inPlanDate?: string;
    cnt?: string;
    ordQty?: string;
    qty?: string;
    amt?: string;
    isCompleted?: boolean;
}
export interface CreateProductOrderProps {
    slipNo?: string;
    nextSlipNo?: string;
    groupYn?: string;
    groupSlipNo?: string;
    outWhCustCd?: string;
    outWhCustNm?: string;
    inWhCustCd?: string;
    inWhCustNm?: string;
    sellerCustCd?: string; //판매처
    sellerCustNm?: string;
    purchCustCd?: string;
    prodReqDate?: string;
    reqConfDate?: string;
    prodCompDate?: string;
    searchDate?: string;
    periodChecked?: string;
    processTypeCd?: string; //공정유형코드
    procStatFg?: string; //진행상태(0, 1, 2, 3)
    wmRemark?: string;
    duRemark?: string;
    itemCd?: string;
    itemNm?: string;
    cnt?: string;
    searchStartDate?: string;
    searchEndDate?: string;
    barcodeNo?: string;
    distrHistoryNo?: string;
    rn?: string;
    colorFlag?: string;
    originSlipNo?: string;
}
