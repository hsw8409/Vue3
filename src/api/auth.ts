/**
 * @file     /api/auth.ts
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 * 권한관리 관련 API
 */

import api from '@/common/axios/api';
import type { UserProps } from '@/types/auth';
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
    return api.post('/api/v1/login', params);
};

// 로그아웃
export const logout = (params: UserProps) => {
    return api.post('/api/v1/logout', params);
};

// 사용자 목록 조회
export const selectUserList = (params: UserProps) => {
    return api.get(`${BASE}/userDetail/selectUserList`, { params });
};

// 아이디 중복 체크
export const checkUserIdDuplication = (params: UserProps) => {
    return api.get(`${BASE}/UserRegistration/checkIdDuplication`, { params });
};

// SCM 사용 여부 확인
export const checkChainScmUseYn = (params: UserProps) => {
    return api.get(`${BASE}/UserRegistration/checkChainScmUseYn`, { params });
};

// 사용자 등록
export const insertUser = (params: UserProps) => {
    return api.post(`${BASE}/UserRegistration/insertUser`, params);
};

// 사용자 수정
export const updateUser = (params: UserProps) => {
    return api.post(`${BASE}/UserRegistration/updateUser`, params);
};

// 물류센터 조회
export const selectWHCenterGroup = (params: UserProps) => {
    return api.get(`${BASE}/UserRegistration/selectWHCenterGroup`, { params });
};

// 사용자 조회
export const selectUser = (params: UserProps) => {
    return api.get(`${BASE}/UserRegistration/selectUser`, { params });
};

// 사용자 로그인 로그
export const selectUserLoginLog = (params: UserProps) => {
    return api.get(`${BASE}/selectLog`, { params });
};

// 날짜별 로그
export const selectLogByDate = (params: UserProps) => {
    return api.get(`${BASE}/logByDate`, { params });
};

// 비밀번호 초기화
export const randomPassword = (params: UserProps) => {
    return api.post(`${BASE}/UserRegistration/randomPassword`, params);
};

// 비밀번호 변경
export const updatePassword = (params: UserProps) => {
    return api.post(`${BASE}/UserRegistration/resetPassword`, params);
};

// 마이페이지 수정
export const updateMypage = (params: UserProps) => {
    return api.post(`${BASE}/UserRegistration/updateMyPage`, params);
};
