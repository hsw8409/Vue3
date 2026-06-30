/**
 * @file     /api/customer.ts
 * @menu     거래처 관련 api
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 *
 * @description
 * 최초 생성
 */

// ==================================================
// import 영역
// ==================================================
import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios';
import type { CustomerProps } from '@/types/customer';

// =========================
// API BASE
// =========================
const BASE = '/api/v1/biz/customer';

// =========================
// API FUNCTIONS
// =========================

// 거래처 조회
export function selectPopupCustomerList(params: CustomerProps) {
    return api.get<ApiResponse<CustomerProps>>(`${BASE}/selectCustomerList`, { params });
}
