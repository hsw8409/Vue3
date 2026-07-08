/**
 * @file     /api/main.ts
 * @menu     메인 관련 api
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */
// =====================================================================================================
// import 영역
// =====================================================================================================
import { AxiosRequestConfig } from 'axios';
import api from '@/common/axios/api';

// =====================================================================================================
// Type 선언
// =====================================================================================================
import type { ApiResponse } from '@/types/api';
import type { CommonCodeProps } from '@/types/commonCode';
import type { LoginProps } from '@/types/auth';
import type { MenuProps } from '@/types/menu';

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const BASE = '/api/v1/main';

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
// 토큰
export const tokenCheck = (config?: AxiosRequestConfig) => {
    return api.post<ApiResponse>(`${BASE}/tokenCheck`, {}, config);
};

// 메뉴목록 조회
export const selectMenu = (params?: LoginProps) => {
    return api.get<ApiResponse<MenuProps[]>>(`${BASE}/selectMenu`, { params });
};

// 공통코드 조회
export const selectComCd = () => {
    return api.post<ApiResponse<CommonCodeProps>>(`${BASE}/selectCommCd`);
};
