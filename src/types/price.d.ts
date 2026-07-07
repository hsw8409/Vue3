export interface PriceCopyReqProps {
    userId?: string;
    group?: PriceGroupProps[];
    item?: PriceItemProps[];
}

export interface PriceGroupProps {
    purchPrcGrpCd?: string; /* 매입단가그룹코드 */
    purchPrcGrpNm?: string; /* 매입단가그룹명칭 */
    useYn?: string; /* 사용여부 */
    countItem?: string; /* 품목건수 */
    userId?: string;
    custCd?: string;
    custNm?: string;
}

export interface PriceItemProps {
    currentDate?: string;
    itemCd?: string;
    itemNm?: string;
    taxFreeGbnCd?: string;
    originCd?: string;
    originDate?: string;
    spec?: string;
    itemRating?: string;
    packingUnitQty?: string;
    lclsItemCd?: string;
    mclsItemCd?: string;
    sclsItemCd?: string;
    lclsItemNm?: string;
    mclsItemNm?: string;
    sclsItemNm?: string;
    useYn?: string;
    Price?: string;
    purPrice?: string;
    applyPrcGbnCd?: string;
    applyStdDate?: string;
    purchPrcGrpCd?: string;
    applyUnitPrc?: string;
    userId?: string;
    barcodeMappingYn?: string;
    custCd?: string;
    custNm?: string;
    areaCd?: string;
    ext1ItemCd?: string;
}
