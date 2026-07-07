/**
 * @file     /stores/favorite.ts
 * @menu     즐겨찾기 관리 store
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { selectFavoriteMenu, addFavorite, deleteFavorite } from '@/api/favorite';
import type { FavoriteProps } from '@/types/favorite';
// =====================================================================================================
// Type 선언
// =====================================================================================================

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const useFavoriteStore = defineStore('favorite', () => {
    // 1. State: ref로 관리
    const items = ref<FavoriteProps[]>([]);

    // 2. Actions: 일반 함수로 정의
    const fetchFavoriteList = async (userId: string) => {
        try {
            const res = await selectFavoriteMenu({ loginId: userId });
            items.value = res.data?.result || [];
        } catch (error) {
            console.error('...', error);
        }
    };

    const toggleFavorite = async (userId: string, menuCd: string, isCurrentlyOn: boolean) => {
        const apiParams = {
            loginId: userId,
            pmenuCd: menuCd,
        };

        try {
            if (isCurrentlyOn) {
                await deleteFavorite(apiParams);
            } else {
                await addFavorite(apiParams);
            }
            // 상태 변경 후 목록 최신화
            await fetchFavoriteList(userId);
        } catch (error) {
            console.error('...', error);
        }
    };

    return { items, fetchFavoriteList, toggleFavorite };
});
