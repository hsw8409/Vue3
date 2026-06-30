/**
 * @file     /api/favorite.ts
 * @menu     즐겨찾기 관련 api
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */

// ==================================================
// import 영역
// ==================================================
import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios';
import type { FavoriteProps } from '@/types/favorite';

// =========================
// API BASE
// =========================
const BASE = '/api/v1/favorite';

// =========================
// API FUNCTIONS
// =========================

// 즐겨찾기 조회
export function selectFavoriteMenu(params?: FavoriteProps) {
    return api.get<ApiResponse<FavoriteProps[]>>(`${BASE}/selectFavoriteMenu`, { params });
}

// 즐겨찾기 추가
export function addFavorite(params?: FavoriteProps) {
    return api.post<ApiResponse>(`${BASE}/addFavorite`, params);
}
// 즐겨찾기 삭제
export function deleteFavorite(params?: FavoriteProps) {
    return api.post<ApiResponse>(`${BASE}/deleteFavorite`, params);
}
