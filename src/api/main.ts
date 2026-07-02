/**
 * @file     /api/main.ts
 * @menu     메인 관련 api
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */
import { AxiosRequestConfig } from 'axios';
import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios';
import type { CommonCodeGProps } from '@/types/commonCode';
import type { LoginProps } from '@/types/auth';
import type { MenuProps } from '@/types/menu';

// =========================
// Type 선언
// =========================

// =========================
// API BASE
// =========================
const BASE = '/api/v1/main';

// =========================
// API FUNCTIONS
// =========================
// 토큰
export const tokenCheck = (config?: AxiosRequestConfig) => {
    return api.post<ApiResponse>(`${BASE}/tokenCheck`, {}, config);
};

// 메뉴목록 조회
export function selectMenu(params?: LoginProps) {
    return api.get<ApiResponse<MenuProps[]>>(`${BASE}/selectMenu`, { params });
}

// 공통코드 조회
export function selectComCd() {
    return api.post<ApiResponse<CommonCodeGProps>>(`${BASE}/selectCommCd`);
}
