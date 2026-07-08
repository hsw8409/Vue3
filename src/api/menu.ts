/**
 * @file     /api/menu.ts
 * @menu     메뉴 관련 api
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 *
 * @description
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import api from '@/common/axios/api';

// =====================================================================================================
// Type 선언
// =====================================================================================================
import type { ApiResponse } from '@/types/api';
import type {
    LMenuProps,
    MMenuProps,
    PMenuProps,
    MenuGroupProps,
    MenuGroupUserProps,
    MenuGroupResProps,
} from '@/types/menu';

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const BASE = '/api/v1/biz/menu';

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

// 대분류목록 조회
export const selectLmenuList = () => {
    return api.get<ApiResponse<LMenuProps[]>>(`${BASE}/menuManage/selectLmenuList`);
};

// 중분류목록 조회
export const selectMmenuList = (params: MMenuProps) => {
    return api.get<ApiResponse<MMenuProps[]>>(`${BASE}/menuManage/selectMmenuList`, { params });
};

// 프로그램목록 조회
export const selectPmenuList = (params: PMenuProps) => {
    return api.get<ApiResponse<PMenuProps[]>>(`${BASE}/menuManage/selectPmenuList`, { params });
};

// 대분류 저장
export const saveLmenu = (params: any) => {
    return api.post<ApiResponse>(`${BASE}/menuManage/saveLmenu`, params);
};

// 중분류 저장
export const saveMmenu = (params: any) => {
    return api.post<ApiResponse>(`${BASE}/menuManage/saveMmenu`, params);
};

// 프로그램 저장
export const savePmenu = (params: any) => {
    return api.post<ApiResponse>(`${BASE}/menuManage/savePmenu`, params);
};

// 메뉴그룹정보 조회
export const selectMenuGroup = () => {
    return api.get<ApiResponse<MenuGroupProps[]>>(`${BASE}/selectMenuGroup`);
};

// 메뉴그룹별 프로그램정보 조회
export const selectMenuGroupUserProgram = (params: MenuGroupUserProps) => {
    return api.get<ApiResponse<MenuGroupResProps>>(`${BASE}/selectMenuGroupUserProgram`, {
        params,
    });
};

// 메뉴그룹별 프로그램정보 저장
export const saveMenuGroupProgram = (params: any) => {
    return api.post<ApiResponse>(`${BASE}/saveMenuGropListAndUpdateProgramList`, params);
};

// 메뉴그룹 조회
export const selectMenuGroupUsing = (params?: MenuGroupProps) => {
    return api.get<ApiResponse<MenuGroupProps>>(`${BASE}/selectMenuGroupUsing`, { params });
};
