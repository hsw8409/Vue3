/**
 * @file     /api/user.ts
 * @menu     사용자 관련 api
 * @author   astems
 * @since    2026-06-25
 * @version  1.0
 *
 * @description
 */
// =====================================================================================================
// import 영역
// =====================================================================================================
import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios';
import type { UserProps, UserLogProps } from '@/types/auth';

// =====================================================================================================
// Type 선언
// =====================================================================================================

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const BASE = '/api/v1/biz/user';

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

// 사용자목록 조회
export const selectUserList = (params: UserProps) => {
    return api.get<ApiResponse<UserProps[]>>(`${BASE}/userDetail/selectUserList`, { params });
};

// 사용자 아이디 중복 체크
export const checkUserIdDuplication = (params: UserProps) => {
    return api.get<ApiResponse>(`${BASE}/UserRegistration/checkIdDuplication`, { params });
};

// 사용자 아이디 생성
export const insertUser = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/insertUser`, params);
};

// 사용자 아이디 수정
export const updateUser = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/updateUser`, params);
};

// 사용자정보 조회
export const selectUser = (params: UserProps) => {
    return api.get<ApiResponse<UserProps>>(`${BASE}/UserRegistration/selectUser`, { params });
};

// 사용자 로그 조회
export const selectUserLoginLog = (params: UserProps) => {
    return api.get<ApiResponse<UserLogProps[]>>(`${BASE}/selectLog`, { params });
};

// 사용자 로그 조회
export const selectLogByDate = (params: UserProps) => {
    return api.get<ApiResponse<UserLogProps[]>>(`${BASE}/logByDate`, { params });
};

// 비밀번호 재설정
export const randomPassword = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/randomPassword`, params);
};
// ========================================================
// Popup : 마이페이지
// ========================================================

// 비밀번호 변경
export const updatePassword = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/resetPassword`, params);
};
// 마이페이지 정보 변경
export const updateMypage = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/updateMyPage`, params);
};
