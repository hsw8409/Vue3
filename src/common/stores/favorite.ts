/**
 * @file     favorite.ts
 * @menu     즐겨찾기 관리 store
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { defineStore } from 'pinia';
import { selectFavoriteMenu, addFavorite, deleteFavorite } from '@/api/favorite';
import type { FavoriteProps } from '@/types/favorite';
// =====================================================================================================
// Type 선언
// =====================================================================================================

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const useFavoriteStore = defineStore('favorite', {
    state: () => ({
        items: [] as FavoriteProps[],
    }),
    actions: {
        async toggleFavorite(userId: string, menuCd: string, isCurrentlyOn: boolean) {
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
                // 성공하면 목록을 최신화 (MainLeft도 자동으로 변경됨)
                await this.fetchFavoriteList(userId);
            } catch (error) {
                console.error('Favorite Toggle Error:', error);
                throw error; // UI에서 에러 처리를 위해 던져줍니다
            }
        },
        async fetchFavoriteList(userId: string) {
            const res = await selectFavoriteMenu({ loginId: userId });
            this.items = res.data?.result || [];
        },
    },
});
