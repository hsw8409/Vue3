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
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { selectComCd } from '@/api/main';

// =====================================================================================================
// Type 선언
// =====================================================================================================

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const useCommonCodeStore = defineStore('commonCode', () => {
    // 1. State
    const codes = ref<Record<string, any>>({});
    const loaded = ref<boolean>(false);

    // 2. Getters (computed)
    // get 메서드를 getter로 변경하여 더 직관적으로 접근 가능하게 합니다.
    const getCode = computed(() => (group: string) => codes.value[group] ?? []);

    // 3. Actions
    const fetchAll = async (force: boolean = false) => {
        // 이미 로드되어 있으면 재호출 방지
        if (loaded.value && !force) return;

        try {
            const res = await selectComCd();
            const result = res.data?.result;

            if (result) {
                codes.value = result;
                loaded.value = true;
            }
        } catch (error) {
            console.error('공통코드 로드 실패:', error);
            throw error;
        }
    };

    const clear = () => {
        codes.value = {};
        loaded.value = false;
    };

    return { codes, loaded, getCode, fetchAll, clear };
});
