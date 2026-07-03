/*
 * @file     types/axios.d.ts
 * @menu     API 공통 타입 관련
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */

export interface ApiResponse<T = any> {
    code?: number;
    status?: string;
    timestamp?: string;
    result?: T;
}
