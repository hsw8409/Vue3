<script setup lang="ts">
/**
 * @file      App.vue
 * @menu      Root 컴포넌트
 * @author    astems
 * @since     2026-06-23
 * @version   1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, RouterView } from 'vue-router';
import MainLoading from '@/components/main/MainLoading.vue';
import AppPopup from '@/common/utils/popup/AppPopup.vue';

import { useLayoutStore } from '@/common/stores/layout';
import { useAuthStore } from '@/common/stores/auth';
import { useLoadingStore } from '@/common/stores/loadingState';

// ==================================================
// Type 선언 영역
// ==================================================

// ==================================================
// 변수 선언 영역
// ==================================================
const router = useRouter();
const layout = useLayoutStore();
const auth = useAuthStore();
const loading = useLoadingStore();

const appContainer = ref<HTMLElement | null>(null);
const isMobile = ref(false);

let resizeObserver: ResizeObserver | null = null;

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
/**
 * 브라우저 창 크기 변경 감지
 *
 */
const setupResizeObserver = () => {
    if (!appContainer.value) return;

    resizeObserver?.disconnect();

    resizeObserver = new ResizeObserver((item) => {
        const entry = item[0];
        if (!entry) return;

        const { width, height } = entry.contentRect;

        layout.setLayoutHeight(height);
        isMobile.value = width <= 768;
    });

    resizeObserver.observe(appContainer.value);
};

// ==================================================
// Hook 영역
// ==================================================
watch(
    () => auth.isLoggedIn,
    (isLoggedIn) => {
        if (!isLoggedIn) {
            // 불필요한 라우터 push 방지
            const target = isMobile.value ? '/mlogin' : '/login';
            if (router.currentRoute.value.path !== target) {
                router.push(target);
            }
        }
    },
);

onMounted(() => {
    setupResizeObserver();
});

onUnmounted(() => {
    resizeObserver?.disconnect();
});
</script>

<template>
    <div ref="appContainer" style="min-height: 100vh">
        <AppPopup />

        <MainLoading v-if="loading.isLoading" />

        <router-view />
    </div>
</template>
