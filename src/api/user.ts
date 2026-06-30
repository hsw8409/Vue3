/**
 * @file     /api/user.ts
 * @menu     사용자 관련 api
 * @author   astems
 * @since    2026-06-25
 * @version  1.0
 *
 * @description
 */

import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios';
import type { UserProps, UserLogProps } from '@/types/auth';

// =========================
// API BASE
// =========================
const BASE = '/api/v1/biz/user';

// =========================
// API FUNCTIONS
// =========================

// 사용자목록 조회
export function selectUserList(params: UserProps) {
    return api.get<ApiResponse<UserProps>>(`${BASE}/userDetail/selectUserList`, { params });
}

// 사용자 아이디 중복 체크
export function checkUserIdDuplication(params: UserProps) {
    return api.get<ApiResponse>(`${BASE}/UserRegistration/checkIdDuplication`, { params });
}

// 사용자 아이디 생성
export function insertUser(params: UserProps) {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/insertUser`, params);
}

// 사용자 아이디 수정
export function updateUser(params: UserProps) {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/updateUser`, params);
}

// 사용자정보 조회
export function selectUser(params: UserProps) {
    return api.get<ApiResponse<UserProps>>(`${BASE}/UserRegistration/selectUser`, { params });
}

// 사용자 로그 조회
export function selectUserLoginLog(params: UserProps) {
    return api.get<ApiResponse<UserLogProps>>(`${BASE}/selectLog`, { params });
}

// 사용자 로그 조회
export function selectLogByDate(params: UserProps) {
    return api.get<ApiResponse<UserLogProps>>(`${BASE}/logByDate`, { params });
}

// 비밀번호 재설정
export function randomPassword(params: UserProps) {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/randomPassword`, params);
}
// ========================================================
// Popup : 마이페이지
// ========================================================

// 비밀번호 변경
export function updatePassword(params: UserProps) {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/resetPassword`, params);
}
// 마이페이지 정보 변경
export function updateMypage(params: UserProps) {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/updateMyPage`, params);
}
