/**
 * @file     /api/menu.ts
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 *
 * @description
 * 메뉴 관련 API
 */

import api from '@/common/axios/api';

// =========================
// API BASE
// =========================
const BASE = '/api/v1/biz/menu';

// =========================
// API FUNCTIONS
// =========================

// 대분류목록 조회
export function selectLmenuList() {
    return api.get(`${BASE}/menuManage/selectLmenuList`);
}

// 중분류목록 조회
export function selectMmenuList(params: any) {
    return api.get(`${BASE}/menuManage/selectMmenuList`, { params });
}

// 프로그램목록 조회
export function selectPmenuList(params: any) {
    return api.get(`${BASE}/menuManage/selectPmenuList`, { params });
}

// 대분류 저장
export function saveLmenu(params: any) {
    return api.post(`${BASE}/menuManage/saveLmenu`, params);
}

// 중분류 저장
export function saveMmenu(params: any) {
    return api.post(`${BASE}/menuManage/saveMmenu`, params);
}

// 프로그램 저장
export function savePmenu(params: any) {
    return api.post(`${BASE}/menuManage/savePmenu`, params);
}

// 메뉴그룹정보 조회
export function selectMenuGroup() {
    return api.get(`${BASE}/selectMenuGroup`);
}

// 메뉴그룹별 프로그램정보 조회
export function selectMenuGroupUserProgram(params: any) {
    return api.get(`${BASE}/selectMenuGroupUserProgram`, { params });
}

// 메뉴그룹생성
export function insertMenuGroup(params: any) {
    return api.post(`${BASE}/insertList`, params);
}

// 메뉴그룹수정
export function updateMenuGroup(params: any) {
    return api.post(`${BASE}/updateList`, params);
}

// 메뉴그룹삭제
export function deleteMenuGroup(params: any) {
    return api.post(`${BASE}/deleteList`, params);
}

// 메뉴그룹저장
export function saveMenuGroup(params: any) {
    return api.post(`${BASE}/saveMenuGropList`, params);
}

// 메뉴그룹별 프로그램정보 저장
export function saveMenuGroupProgram(params: any) {
    return api.post(`${BASE}/saveMenuGropListAndUpdateProgramList`, params);
}

// 메뉴그룹별 프로그램정보 수정
export function updateMenuGroupProgram(params: any) {
    return api.post(`${BASE}/programUpdate`, params);
}

// 메뉴그룹 조회
export function selectMenuGroupUsing(params: any) {
    return api.get(`${BASE}/selectMenuGroupUsing`, { params });
}
