/**
 * @file     /api/auth.ts
 * @menu     권한 관련 api
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 * 최초 생성
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import api from '@/common/axios/api'; // axios api

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================
import type { ApiResponse } from '@/types/api';
import type { UserProps, UserLogProps, LoginResProps } from '@/types/auth';

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
const BASE = '/api/v1/biz/user';

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
// 로그인
export const login = (params: UserProps) => {
    return api.post<ApiResponse<LoginResProps>>('/api/v1/login', params);
};

// 로그아웃
export const logout = (params: UserProps) => {
    return api.post<ApiResponse>('/api/v1/logout', params);
};

// 사용자 목록 조회
export const selectUserList = (params: UserProps) => {
    return api.get<ApiResponse<UserProps>>(`${BASE}/userDetail/selectUserList`, { params });
};

// 아이디 중복 체크
export const checkUserIdDuplication = (params: UserProps) => {
    return api.get<ApiResponse>(`${BASE}/UserRegistration/checkIdDuplication`, { params });
};

// 사용자 등록
export const insertUser = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/insertUser`, params);
};

// 사용자 수정
export const updateUser = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/updateUser`, params);
};

// 사용자 조회
export const selectUser = (params: UserProps) => {
    return api.get<ApiResponse<UserProps>>(`${BASE}/UserRegistration/selectUser`, { params });
};

// 사용자 로그인 로그
export const selectUserLoginLog = (params: UserProps) => {
    return api.get<ApiResponse<UserLogProps>>(`${BASE}/selectLog`, { params });
};

// 날짜별 로그
export const selectLogByDate = (params: UserProps) => {
    return api.get<ApiResponse<UserLogProps>>(`${BASE}/logByDate`, { params });
};

// 비밀번호 초기화
export const randomPassword = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/randomPassword`, params);
};

// 비밀번호 변경
export const updatePassword = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/resetPassword`, params);
};

// 마이페이지 수정
export const updateMypage = (params: UserProps) => {
    return api.post<ApiResponse>(`${BASE}/UserRegistration/updateMyPage`, params);
};
