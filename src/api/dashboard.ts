/**
 * @file     /api/main.ts
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 * 메인기능 관련 API
 */

import api from '@/common/axios/api';

// =========================
// API BASE
// =========================
const BASE = '/api/v1/dashboard';

// =========================
// API FUNCTIONS
// =========================
// 대시보드 조회
export function selectDashboard01Data() {
    return api.get(`${BASE}/selectDashboard01Data`);
}

// 대시보드 조회
export function selectDashboard02Data() {
    return api.get(`${BASE}/selectDashboard02Data`);
}
