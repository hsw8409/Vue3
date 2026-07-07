/**
 * @file     /stores/menu.ts
 * @menu     메뉴목록 관리 store
 * @author   astems
 * @since    2026-07-06
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { selectMenu } from '@/api/main';

import type { MenuProps, MenuItemProps, SelectedMenuProps } from '@/types/menu';

// =====================================================================================================
// Type 선언
// =====================================================================================================

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const useMenuStore = defineStore('menu', () => {
    const menuList = ref<MenuItemProps[]>([]);
    const isLoading = ref(false);

    // 메뉴 데이터 가져오기 (MainPage에서 하던 로직)
    const fetchMenuList = async (params: { loginChainCd: string; loginId: string }) => {
        isLoading.value = true;
        try {
            const response = await selectMenu(params);
            const rawData = response.data.result ?? [];

            menuList.value = rawData.map((menu: MenuProps) => ({
                mcd: menu.mcd ?? '',
                mnm: menu.mnm ?? '',
                pcd: menu.pcd,
                lv: menu.lv ?? 0,
                mpath: menu.mpath,
                fileNm: menu.fileNm,
            }));
        } catch (error) {
            console.error('메뉴 로드 실패:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const getSelectedMenu = (mcd: string): SelectedMenuProps | null => {
        const lv3 = menuList.value.find((m) => m.mcd === mcd && Number(m.lv) === 3);
        if (!lv3) return null;

        const lv2 = menuList.value.find((m) => m.mcd === lv3.pcd && Number(m.lv) === 2);
        if (!lv2) return null;

        const lv1 = menuList.value.find((m) => m.mcd === lv2.pcd && Number(m.lv) === 1);
        if (!lv1) return null;

        return {
            lname: lv1.mnm,
            mname: lv2.mnm,
            sname: lv3.mnm,
            path: lv3.mpath,
            mcd: lv3.mcd,
            fileNm: lv3.fileNm,
        };
    };

    return { menuList, fetchMenuList, getSelectedMenu };
});
