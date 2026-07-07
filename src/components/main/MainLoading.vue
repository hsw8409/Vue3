<script setup lang="ts">
/**
 * @file    components/main/MainLoading.vue
 * @menu    로딩바
 * @author  astems
 * @since    2026-06-23
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { computed } from 'vue';
import { useLoadingStore } from '@/common/stores/loadingState';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
const loadingStore = useLoadingStore();

const isLoading = computed(() => loadingStore.isLoading);

let timer: ReturnType<typeof setTimeout> | null = null;
let count = 0;

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

const reset = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    count = 0;
};

/**
 * 로딩바 선택시 강제 종료
 *
 */
const onClick = () => {
    // 3초 내에 연속 클릭하지 않으면 타이머 초기화됨
    if (!timer) {
        timer = setTimeout(reset, 3000);
    }

    count++;

    // 5회 이상 클릭 시 로딩 강제 종료
    if (count >= 5) {
        loadingStore.reset();
        reset();
    }
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
</script>

<template>
    <div v-if="isLoading" class="loading-overlay">
        <div class="looping-rhombuses-spinner">
            <div class="rhombus"></div>
            <div class="rhombus"></div>
            <div class="rhombus"></div>
        </div>
        <button
            type="button"
            class="subBtn easter-egg"
            aria-label="로딩 강제 초기화"
            @click="onClick"
        ></button>
    </div>
</template>

<style scoped>
.easter-egg {
    z-index: 8888;
    position: absolute;
    bottom: 0;
    right: 0;
    width: 50px; /* 버튼 크기 명시 */
    height: 50px;
    border: 0;
    background: transparent; /* 투명하게 처리하여 사용자에게 노출되지 않음 */
    cursor: default;
}

.easter-egg:hover {
    background-color: transparent;
}

/* 스피너 스타일 유지 */
.looping-rhombuses-spinner,
.looping-rhombuses-spinner * {
    box-sizing: border-box;
}

.looping-rhombuses-spinner {
    width: calc(15px * 4);
    height: 15px;
    position: relative;
}

.looping-rhombuses-spinner .rhombus {
    height: 15px;
    width: 15px;
    background-color: #1565c0;
    left: calc(15px * 4);
    position: absolute;
    margin: 0 auto;
    border-radius: 2px;
    transform: translateY(0) rotate(45deg) scale(0);
    animation: looping-rhombuses-spinner-animation 2500ms linear infinite;
}

.looping-rhombuses-spinner .rhombus:nth-child(1) {
    animation-delay: calc(2500ms * 1 / -1.5);
}
.looping-rhombuses-spinner .rhombus:nth-child(2) {
    animation-delay: calc(2500ms * 2 / -1.5);
}
.looping-rhombuses-spinner .rhombus:nth-child(3) {
    animation-delay: calc(2500ms * 3 / -1.5);
}

@keyframes looping-rhombuses-spinner-animation {
    0% {
        transform: translateX(0) rotate(45deg) scale(0);
    }
    50% {
        transform: translateX(-233%) rotate(45deg) scale(1);
    }
    100% {
        transform: translateX(-466%) rotate(45deg) scale(0);
    }
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5); /* 반투명 배경 추가로 로딩 체감 향상 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 7777;
}
</style>
