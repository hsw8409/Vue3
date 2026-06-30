/**
 * @file     /api/dashboard.ts
 * @menu     대시보드 관련 api
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */

import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios'; // axios api 응답
import type { DashboardProps } from '@/types/dashboard';

// =========================
// API BASE
// =========================
const BASE = '/api/v1/dashboard';

// =========================
// API FUNCTIONS
// =========================
// 대시보드 조회
export function selectDashboard01Data() {
    return api.get<ApiResponse<DashboardProps>>(`${BASE}/selectDashboard01Data`);
}

// 대시보드 조회
export function selectDashboard02Data() {
    return api.get<ApiResponse<DashboardProps>>(`${BASE}/selectDashboard02Data`);
}
