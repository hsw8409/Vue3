export interface LitemProps {
    lclsItemCd?: string;
    lclsItemNm?: string;
    orderBySeq?: string;
    useYn?: string;
    userId?: string;
    lclsGbnCd?: string;
}

export interface MitemProps {
    lclsItemCd?: string;
    mclsItemCd?: string;
    mclsItemNm?: string;
    orderBySeq?: string;
    useYn?: string;
    userId?: string;
    mclsGbnCd?: string;
}

export interface SitemProps {
    lclsItemCd?: string;
    mclsItemCd?: string;
    sclsItemCd?: string;
    sclsItemNm?: string;
    orderBySeq?: string;
    useYn?: string;
    userId?: string;
}

export interface CategoryProps {
    chainCd?: string;
    categoryCd?: string;
    categoryNm?: string;
    parentCd?: string;
}

export interface CategoryGroupsProps {
    lclsCategory: CategoryProps[];
    mclsCategory: CategoryProps[];
    sclsCategory: CategoryProps[];
}

export interface ItemProps {
    chainCd?: string;
    itemCd?: string;
    itemNm?: string;
    labelNm?: string;
    taxFreeGbnCd?: string;
    lclsItemCd?: string;
    lclsItemNm?: string;
    mclsItemCd?: string;
    mclsItemNm?: string;
    sclsItemCd?: string;
    sclsItemNm?: string;
    spec?: string;
    dtlSpec?: string;
    originCd?: string;
    dtlOrigin?: string;
    basUnitCd?: string;
    orderContractUnitCd?: string;
    boxQty?: number;
    packingUnitQty?: number;
    oneAnimalQty?: number;
    minOrderQty?: number;
    decimalPointOrderCd?: string;
    displayWt?: string;
    distrHistoryMngYn?: string;
    distrExpiryDayCnt?: number;
    buyerId?: string;
    itemTypeCd?: string;
    orderCloseCountCd?: string;
    keepTempGbnCd?: string;
    imgFileId?: string;
    itemRating?: string;
    selfThirdYn?: string;
    invMngStdCd?: string;
    tranStatCd?: string;
    useYn?: string;
    insId?: string;
    insDtime?: string;
    updId?: string;
    updDtime?: string;
    originalFileName?: string;
    downPath?: string;
    cowPigGbnFg?: string;
    fixWtQty?: string;
    standardPartCd?: string;
    show?: string;
    reportNo?: string;
    ingredients?: string;
    usage?: string;
    expirationDate?: string;
    wmOrderItemReqDtl?: boolean;
}

export interface ItemLabelProps {
    chainCd?: string;
    itemCd?: string;
    itemNm?: string;
    itemLabelYn?: string;
    fixWtQty?: string;
    labelNm?: string;
    reportNo?: string;
    ingredients?: string;
    usage?: string;
    fixPacBarcodeNo88?: string;
    labelWtUnit?: string;
    packItemYn?: string;
    selfThirdYn?: string;
    expirationLifeDay?: string;
}

export interface ItemPriceProps {
    purchCustCd?: string;
    purchCustNm?: string;
    saleCustCd?: string;
    saleCustNm?: string;
    whcenterCd?: string;
    whcenterNm?: string;
    itemCd?: string;
    itemNm?: string;
    taxFreeGbnCd?: string;
    spec?: string;
    dtlSpec?: string;
    originCd?: string;
    dtlOrigin?: string;
    basUnitCd?: string;
    orderContractUnitCd?: string;
    boxQty?: number;
    packingUnitQty?: number;
    oneAnimalQty?: number;
    minOrderQty?: number;
    displayWt?: string;
    distrHistoryMngYn?: string;
    distrExpiryDayCnt?: number;
    buyerId?: string;
    itemTypeCd?: string;
    orderCloseCountCd?: string;
    keepTempGbnCd?: string;
    itemRating?: string;
    selfThirdYn?: string;
    invMngStdCd?: string;
    tranStatCd?: string;
    useYn?: string;
    lclsItemCd?: string;
    lclsItemNm?: string;
    mclsItemCd?: string;
    mclsItemNm?: string;
    sclsItemCd?: string;
    producDate?: string;
    sclsItemNm?: string;
    purchUnitPrice?: number;
    saleUnitPrice?: number;
    inPlanDate?: string;
    currStockQty?: number;
    nowStockQty?: number;
    cowPigGbnFg?: string;
    slipNo?: string;
    barcodeNo?: string;
    distrHistoryNo?: string;
    outQty?: string;
    outWtQty?: string;
    outAmt?: string;
    slaugterDate?: string;
    slaugterNm?: string;
    refDistrHistoryNo?: string;
    inUnitPrice?: string;
    inDate?: string;
    apiErrCd?: string;
    apiErrMsg?: string;
    apiSendDtime?: string;
}
