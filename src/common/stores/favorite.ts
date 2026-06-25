// stores/favorite.ts
import { defineStore } from 'pinia';
import { selectFavoriteMenu, addFavorite, deleteFavorite } from '@/api/favorite';

export const useFavoriteStore = defineStore('favorite', {
    state: () => ({
        items: [] as any[],
    }),
    actions: {
        async toggleFavorite(userId: string, menuCd: string, isCurrentlyOn: boolean) {
            const apiParams = {
                loginId: userId,
                menuSclsCd: menuCd,
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
