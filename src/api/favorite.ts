/**
 * @file     /api/favorite.ts
 * @menu     즐겨찾기 관련 api
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios';
import type { FavoriteProps } from '@/types/favorite';

// =====================================================================================================
// Type 선언
// =====================================================================================================

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const BASE = '/api/v1/favorite';

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
// 즐겨찾기 조회
export const selectFavoriteMenu = (params?: FavoriteProps) => {
    return api.get<ApiResponse<FavoriteProps[]>>(`${BASE}/selectFavoriteMenu`, { params });
};

// 즐겨찾기 추가
export const addFavorite = (params?: FavoriteProps) => {
    return api.post<ApiResponse>(`${BASE}/addFavorite`, params);
};
// 즐겨찾기 삭제
export const deleteFavorite = (params?: FavoriteProps) => {
    return api.post<ApiResponse>(`${BASE}/deleteFavorite`, params);
};
