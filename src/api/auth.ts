/**
 * @file     /api/auth.ts
 * @menu     권한 관련 api
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 * 최초 생성
 * 안녕하세요 커밋테스트입니다
 */

// ==================================================
// import 영역
// ==================================================
import api from '@/common/axios/api'; // axios api
import type { ApiResponse } from '@/types/axios';
import type { UserProps, UserLogProps } from '@/types/auth';
import type { TokenProps } from '@/types/token';

// =========================
// Type 선언
// =========================
export interface LoginResProps {
    user: UserProps;
    token: TokenProps;
}

// =========================
// API BASE
// =========================
const BASE = '/api/v1/biz/user';

// =========================
// API FUNCTIONS
// =========================
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
