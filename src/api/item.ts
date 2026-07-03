/**
 * @file     /api/item.ts
 * @menu     품목 관련 api
 * @author   astems
 * @since    2026-06-28
 * @version  1.0
 *
 * @description
 */

// ==================================================
// import 영역
// ==================================================
import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios';
import type {
    LitemProps,
    MitemProps,
    SitemProps,
    CategoryProps,
    CategoryGroupsProps,
    ItemProps,
    ItemLabelProps,
    ItemPriceProps,
} from '@/types/item';

// =====================================================================================================
// Type 선언
// =====================================================================================================

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const BASE = '/api/v1/biz/item';

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
// 대분류 품목 조회
export const selectItemListL = (params: LitemProps) => {
    return api.get<ApiResponse<LitemProps[]>>(`${BASE}/itemManage/selectLitem`, { params });
};

// UI_ITM_001.vue
// 중분류 품목 조회
export const selectItemListM = (params: MitemProps) => {
    return api.get<ApiResponse<MitemProps[]>>(`${BASE}/itemManage/selectMitem`, { params });
};

// UI_ITM_001.vue
// 소분류 품목 조회
export const selectItemListS = (params: SitemProps) => {
    return api.get<ApiResponse<SitemProps[]>>(`${BASE}/itemManage/selectSitem`, { params });
};

// UI_ITM_001.vue
// 대분류 품목 저장
export const saveItemL = (params: LitemProps) => {
    return api.post<ApiResponse>(`${BASE}/itemManage/saveLitem`, params);
};

// UI_ITM_001.vue
// 중분류 품목 저장
export const saveItemM = (params: MitemProps) => {
    return api.post<ApiResponse>(`${BASE}/itemManage/saveMitem`, params);
};

// UI_ITM_001.vue
// 소분류 품목 저장
export const saveItemS = (params: SitemProps) => {
    return api.post<ApiResponse>(`${BASE}/itemManage/saveSitem`, params);
};

// UI_ITM_002.vue
// 품목 카테고리 조회
export const selectCategories = (params: CategoryProps) => {
    return api.get<ApiResponse<CategoryGroupsProps>>(`${BASE}/itemDetail/selectCategories`, {
        params,
    });
};

// UI_ITM_002.vue
// 품목 상세 정보 조회
export const selectItem = (params: ItemProps) => {
    return api.get<ApiResponse<ItemProps[]>>(`${BASE}/itemDetail/selectItem`, { params });
};

// UI_ITM_002.vue
// 품목 상세 정보 저장
export const saveItemReg = (params: any) => {
    return api.post<ApiResponse>(`${BASE}/itemDetail/saveItem`, params, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// UI_ITM_003.vue
// 품목 목록 조회
export const selectItemLabelList = (params: ItemProps) => {
    return api.get<ApiResponse<ItemProps>>(`${BASE}/itemLabel/selectItemList`, { params });
};

// UI_ITM_003.vue
// 품목 속성 조회
export const selectLabelList = (params: ItemLabelProps) => {
    return api.get<ApiResponse<ItemLabelProps>>(`${BASE}/itemLabel/selectLabelList`, { params });
};

// UI_ITM_003.vue
// 속성 저장
export const saveLabel = (params: ItemLabelProps) => {
    return api.post<ApiResponse>(`${BASE}/itemLabel/saveLabel`, params);
};

// ========================================================
// Popup : 품목정보 : UI_ITM_P01.vue
// ========================================================
// 팝업 품목 조회
export const selectPopupItem = (params: ItemProps) => {
    return api.get<ApiResponse<ItemProps>>(`${BASE}/itemDetail/selectPopupItem`, { params });
};

// ========================================================
// Popup : 품목정보 : UI_ITM_P02.vue
// ========================================================
// 팝업 판매단가 품목 조회
export const selectPopupSaleItem = (params: ItemPriceProps) => {
    return api.get<ApiResponse<ItemPriceProps>>(`${BASE}/itemDetail/selectPopupSaleItem`, {
        params,
    });
};

// ========================================================
// Popup : 매입사정보를 포함한 품목팝업 : UI_ITM_P03.vue
// ========================================================
// 조회
export const selectPopupPurchItem = (params: ItemPriceProps) => {
    return api.get<ApiResponse<ItemPriceProps>>(`${BASE}/itemDetail/selectPopupPurchItem`, {
        params,
    });
};
