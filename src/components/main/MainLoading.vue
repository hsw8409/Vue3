<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useLoadingStore } from '@/common/stores/loadingState'; // 🌟 신규 Pinia 스토어 임포트

const loadingStore = useLoadingStore();

// 🌟 기존 loadingState.isLoading 구조에서 Pinia 상태 구조로 체인지!
const isLoading = computed(() => loadingStore.isLoading);

const easterEggState = {
    count: 0,
    timer: null as ReturnType<typeof setTimeout> | null,
};
const easterEgg = reactive({ ...easterEggState });

const handleClick = () => {
    if (easterEgg.timer === null) {
        startTimer();
    }

    easterEgg.count++;

    if (easterEgg.count >= 5) {
        executeFunction();
    }
};

const startTimer = () => {
    easterEgg.timer = setTimeout(() => {
        reset();
    }, 3000);
};

const executeFunction = () => {
    reset();
    loadingStore.reset(); // 🌟 Pinia 리셋 액션 호출
};

const reset = () => {
    if (easterEgg.timer) clearTimeout(easterEgg.timer);
    easterEgg.timer = null;
    easterEgg.count = 0;
};
</script>

<template>
    <div v-if="isLoading" class="loading-overlay">
        <div class="looping-rhombuses-spinner">
            <div class="rhombus"></div>
            <div class="rhombus"></div>
            <div class="rhombus"></div>
        </div>
        <button class="subBtn easter-egg" @click="handleClick"></button>
    </div>
</template>

<style scoped>
.easter-egg {
    z-index: 8888;
    position: absolute;
    bottom: 0;
    right: 0;
    border: 0;
}
.easter-egg:hover {
    background-color: #fff;
    cursor: auto;
}

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
    background: rgba(255, 255, 255, 0);
    /* background: rgba(255, 255, 255, 0.7); */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 7777;
}
</style>
