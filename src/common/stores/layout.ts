/**
 * @file     layout.ts
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

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const useLayoutStore = defineStore('layout', {
    state: () => ({
        layoutHeight: 0,
    }),
    getters: {
        // 예: 컨텐츠 영역의 남은 높이를 계산해야 할 때 유용
        getContentHeight: (state) => (windowHeight: number) => {
            return windowHeight - state.layoutHeight;
        },
    },
    actions: {
        setLayoutHeight(height: number) {
            this.layoutHeight = height;
        },
    },
});
