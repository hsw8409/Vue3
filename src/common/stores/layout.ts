/**
 * @file     /common/stores/layout.ts
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
    // State
    const layoutHeight = ref<number>(0);
    const isLnbHidden = ref<boolean>(false);

    // Getters
    const getContentHeight = computed(() => (windowHeight: number) => {
        return windowHeight - layoutHeight.value;
    });

    // Actions
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
