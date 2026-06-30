/**
 * @file     /api/commonCode.ts
 * @menu     공통코드 api
 * @author   astems
 * @since    2026-06-25
 * @version  1.0
 *
 * @description
 * 최초 생성
 */

// ==================================================
// import 영역
// ==================================================
import api from '@/common/axios/api'; // axios api
import type { ApiResponse } from '@/types/axios'; // axios api 응답
import type { CommonCodeGroupProps, CommonCodeGProps } from '@/types/commonCode'; // 공통코드 타입

// =========================
// API BASE
// =========================
const BASE = '/api/v1/biz/commonCode';

// =========================
// API FUNCTIONS
// =========================

// 공통코드 그룹 조회
export function selectGroupList(params: CommonCodeGroupProps) {
    return api.get<ApiResponse<CommonCodeGroupProps>>(`${BASE}/selectGroupList`, { params });
}

// 공통코드상세 조회
export function selectDetailList(params: CommonCodeGProps) {
    return api.get<ApiResponse<CommonCodeGProps>>(`${BASE}/selectDetailList`, { params });
}

// 공통코드 저장
export function saveComCode(params: any) {
    return api.post<ApiResponse>(`${BASE}/saveList`, params);
}
