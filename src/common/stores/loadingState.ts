/**
 * @file     loadingState.ts
 * @menu     로딩바 관련 store
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
export const useLoadingStore = defineStore('loading', () => {
    // ==================================================
    // 상태 값 (State)
    // ==================================================
    const count = ref(0);
    const flag = ref(false);
    const timer = ref<ReturnType<typeof setTimeout> | null>(null);
    const delay = ref(1); // 기존 1ms 딜레이 유지

    // ==================================================
    // 연산 프로퍼티 (Getters)
    // ==================================================
    const isLoading = computed(() => count.value > 0 && flag.value);

    // ==================================================
    // 비즈니스 로직 (Actions)
    // ==================================================
    const incrementLoading = () => {
        count.value++;

        if (timer.value === null) {
            timer.value = setTimeout(() => {
                if (count.value > 0) {
                    flag.value = true;
                }
            }, delay.value);
        }
    };

    const decrementLoading = () => {
        count.value--;

        if (count.value <= 0) {
            reset();
        }
    };

    const reset = () => {
        if (timer.value) {
            clearTimeout(timer.value);
        }
        timer.value = null;
        flag.value = false;
        count.value = 0;
    };

    return {
        count,
        flag,
        isLoading,
        incrementLoading,
        decrementLoading,
        reset,
    };
});
