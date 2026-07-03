/**
 * @file     loadingState.ts
 * @menu     로딩바
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { reactive } from 'vue';

// =====================================================================================================
// Type 선언
// =====================================================================================================
interface LoadingState {
    count: number;
    flag: boolean;
    timer: ReturnType<typeof setTimeout> | null;
    delay: number;
}

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const state = reactive<LoadingState>({
    count: 0,
    flag: false,
    timer: null,
    delay: 1,
});

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const loadingState = {
    incrementLoading(): void {
        state.count++;

        if (state.timer === null) {
            state.timer = setTimeout(() => {
                if (state.count > 0) {
                    state.flag = true;
                }
            }, state.delay);
        }
    },

    decrementLoading(): void {
        state.count--;

        if (state.count <= 0) {
            this.reset();
        }
    },

    reset(): void {
        if (state.timer) {
            clearTimeout(state.timer);
        }

        state.timer = null;
        state.flag = false;
        state.count = 0;
    },

    get isLoading(): boolean {
        return state.count > 0 && state.flag;
    },
};
