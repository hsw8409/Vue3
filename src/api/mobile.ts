/**
 * @file     /api/mobile.ts
 * @menu     모바일 관련 api
 * @author   astems
 * @since    2026-07-01
 * @version  1.0
 *
 * @description
 * 최초 생성
 */

// ==================================================
// import 영역
// ==================================================
import api from '@/common/axios/api'; // axios api
import type { ApiResponse } from '@/types/axios';

// =========================
// Type 선언
// =========================

// =========================
// API BASE
// =========================
const BASE = '/api/v1/biz/mobile';

// =========================
// API FUNCTIONS
// =========================
// 로그인
export const mobilePurchaseList = (params: any) => {
    return api.post<ApiResponse>(`${BASE}/mobilePurchaseList`, params);
};
