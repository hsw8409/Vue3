/**
 * @file     /api/common.ts
 * @author   hsw
 * @since    2025-10-13
 * @version  1.0
 *
 * @description
 * 최초 생성
 * 공통코드 관련 api
 */

import api from '@/common/axios/api';

// 공통코드 그룹 조회
export function selectGroupList(params: any) {
    return api.get('/api/v1/biz/commonCode/selectGroupList', { params });
}

// 공통코드상세 조회
export function selectDetailList(params: any) {
    return api.get('/api/v1/biz/commonCode/selectDetailList', { params });
}

// 공통코드 저장
export function saveComCode(params: any) {
    return api.post('/api/v1/biz/commonCode/saveList', params);
}
