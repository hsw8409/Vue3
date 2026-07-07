/**
 * @file     /stores/layout.ts
 * @menu     레이아웃 관련 store
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const useLayoutStore = defineStore('layout', () => {
    // 1. State
    const layoutHeight = ref<number>(0);
    const isLnbHidden = ref<boolean>(false);

    // 2. Getters
    // 함수를 반환하는 computed를 통해 동적 계산
    const getContentHeight = computed(() => (windowHeight: number) => {
        return windowHeight - layoutHeight.value;
    });

    // 3. Actions
    const setLayoutHeight = (height: number) => {
        layoutHeight.value = height;
    };

    const setLnbHidden = (state: boolean) => {
        isLnbHidden.value = state;
    };

    return {
        layoutHeight,
        isLnbHidden,
        getContentHeight,
        setLayoutHeight,
        setLnbHidden,
    };
});
