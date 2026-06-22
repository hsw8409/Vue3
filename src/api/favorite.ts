/**
 * @file     /api/favorite.ts
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 * 즐겨찾기 관련 API
 */

import api from '@/common/axios/api';

// =========================
// API BASE
// =========================
const BASE = '/api/v1/favorite';

// =========================
// API FUNCTIONS
// =========================

// 즐겨찾기 조회
export function selectFavoriteMenu(params?: any) {
    return api.get(`${BASE}/selectFavoriteMenu`, { params });
}

// 즐겨찾기 조회
export function addFavorite(params?: any) {
    return api.post(`${BASE}/addFavorite`, params);
}
// 즐겨찾기 조회
export function deleteFavorite(params?: any) {
    return api.post(`${BASE}/deleteFavorite`, params);
}
