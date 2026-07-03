/**
 * @file     /stores/commonCode.ts
 * @menu     공통코드 관리 store
 * @author   astems
 * @since    2026-07-02
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { defineStore } from 'pinia';
import { selectComCd } from '@/api/main';

export const useCommonCodeStore = defineStore('commonCode', {
    state: () => ({
        codes: {} as Record<string, any>,
        loaded: false,
    }),

    actions: {
        async fetchAll(force = false) {
            // 이미 로드되어 있으면 재호출 방지
            if (this.loaded && !force) return;

            const res = await selectComCd();
            const result = res.data?.result;

            if (result) {
                this.codes = result;
                this.loaded = true;
            }
        },

        get(group: string) {
            return this.codes[group] ?? [];
        },

        clear() {
            this.codes = {};
            this.loaded = false;
        },
    },
});
