/**
 * @file     /api/price.ts
 * @menu     단가 관련 api
 * @author   astems
 * @since    2026-07-03
 * @version  1.0
 *
 * @description
 * 최초 생성
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import api from '@/common/axios/api';

// =====================================================================================================
// Type 선언
// =====================================================================================================
import type { ApiResponse } from '@/types/api';
import type { PriceCopyReqProps, PriceGroupProps, PriceItemProps } from '@/types/price';

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const BASE = '/api/v1/biz/price';

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

export const copyPurchaseGroup = (params: PriceCopyReqProps) => {
    return api.post<ApiResponse>(`${BASE}/purchasePriceGroup/copyPurchaseGroup`, params);
};

export const selectPriceGroup = (params?: PriceGroupProps) => {
    return api.get<ApiResponse<PriceGroupProps[]>>(`${BASE}/purchasePriceGroup/selectPriceGroup`, {
        params,
    });
};

export const selectPriceItem = (params: PriceItemProps) => {
    return api.get<ApiResponse<PriceItemProps[]>>(`${BASE}/purchasePriceGroup/selectPriceItem`, {
        params,
    });
};

export const selectPriceItemLog = (params: PriceItemProps) => {
    return api.get<ApiResponse<PriceItemProps[]>>(`${BASE}/purchasePriceGroup/selectPriceItemLog`, {
        params,
    });
};

export const checkUsableGrp = (params: PriceGroupProps) => {
    return api.post<ApiResponse<PriceGroupProps[]>>(
        `${BASE}/purchasePriceGroup/checkUsable`,
        params,
    );
};

export const saveGroupList = (params: any) => {
    return api.post<ApiResponse>(`${BASE}/purchasePriceGroup/saveGroupList`, params);
};

export const saveItemList = (params: any) => {
    return api.post<ApiResponse>(`${BASE}/purchasePriceGroup/saveItemList`, params);
};

export const saveExcelItemList = (params: any) => {
    return api.post<ApiResponse>(`${BASE}/purchasePriceGroup/saveExcelItemList`, params);
};

export function excelUploadValidation(params: any) {
    return api.post<ApiResponse>(`${BASE}/purchasePriceGroup/excelUploadValidation`, params);
}
