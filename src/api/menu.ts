/**
 * @file     /api/menu.ts
 * @menu     메뉴 관련 api
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 *
 * @description
 */

import api from '@/common/axios/api';
import type { ApiResponse } from '@/types/axios';
import type {
    LMenuProps,
    MMenuProps,
    PMenuProps,
    MenuGroupProps,
    MenuGroupUserProps,
} from '@/types/menu';

// =========================
// API BASE
// =========================
const BASE = '/api/v1/biz/menu';

// =========================
// API FUNCTIONS
// =========================

// 대분류목록 조회
export function selectLmenuList() {
    return api.get<ApiResponse<LMenuProps>>(`${BASE}/menuManage/selectLmenuList`);
}

// 중분류목록 조회
export function selectMmenuList(params: MMenuProps) {
    return api.get<ApiResponse<MMenuProps>>(`${BASE}/menuManage/selectMmenuList`, { params });
}

// 프로그램목록 조회
export function selectPmenuList(params: PMenuProps) {
    return api.get<ApiResponse<PMenuProps>>(`${BASE}/menuManage/selectPmenuList`, { params });
}

// 대분류 저장
export function saveLmenu(params: any) {
    return api.post<ApiResponse>(`${BASE}/menuManage/saveLmenu`, params);
}

// 중분류 저장
export function saveMmenu(params: any) {
    return api.post<ApiResponse>(`${BASE}/menuManage/saveMmenu`, params);
}

// 프로그램 저장
export function savePmenu(params: any) {
    return api.post<ApiResponse>(`${BASE}/menuManage/savePmenu`, params);
}

// 메뉴그룹정보 조회
export function selectMenuGroup() {
    return api.get<ApiResponse<MenuGroupProps>>(`${BASE}/selectMenuGroup`);
}

// 메뉴그룹별 프로그램정보 조회
export function selectMenuGroupUserProgram(params: MenuGroupUserProps) {
    return api.get<ApiResponse<MenuGroupUserProps>>(`${BASE}/selectMenuGroupUserProgram`, {
        params,
    });
}

// 메뉴그룹별 프로그램정보 저장
export function saveMenuGroupProgram(params: any) {
    return api.post<ApiResponse>(`${BASE}/saveMenuGropListAndUpdateProgramList`, params);
}

// 메뉴그룹 조회
export function selectMenuGroupUsing(params?: MenuGroupProps) {
    return api.get<ApiResponse<MenuGroupProps>>(`${BASE}/selectMenuGroupUsing`, { params });
}
