/**
 * @file     /api/main.ts
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 * 메인기능 관련 API
 */
import { AxiosRequestConfig } from 'axios';
import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios';

// =========================
// Type 선언
// =========================

export interface CommonProps {
    commCd?: string;
    dtlCommCd?: string;
    dtlCommNm?: string;
    dtlRef01Cd?: string;
    dtlRef01Nm?: string;
    dtlRef02Cd?: string;
    dtlRef02Nm?: string;
    dtlRef03Cd?: string;
    dtlRef03Nm?: string;
    dtlRef04Cd?: string;
    dtlRef04Nm?: string;
    dtlRef05Cd?: string;
    dtlRef05Nm?: string;
    dtlRef06Cd?: string;
    dtlRef06Nm?: string;
    dtlRef07Cd?: string;
    dtlRef07Nm?: string;
    dtlRef08Cd?: string;
    dtlRef08Nm?: string;
    dtlRef09Cd?: string;
    dtlRef09Nm?: string;
    dtlRef10Cd?: string;
    dtlRef10Nm?: string;
    useYn?: string;
    visiblePurchPrc?: string;
}

export interface MenuProps {
    lv: number;
    mcd: string;
    mnm: string;
    pcd: string;
    mpath?: string;
}

// =========================
// API BASE
// =========================
const BASE = '/api/v1/main';

// =========================
// API FUNCTIONS
// =========================
// 토큰
export const tokenCheck = (config?: AxiosRequestConfig) => {
    return api.post(`${BASE}/tokenCheck`, {}, config);
};

// 메뉴목록 조회
export function selectMenu(params?: any) {
    return api.get<any, ApiResponse<MenuProps[]>>(`${BASE}/selectMenu`, { params });
}

// 공통코드 조회
export function selectComCd(params?: CommonProps) {
    return api.post(`${BASE}/selectCommCd`, params);
}
