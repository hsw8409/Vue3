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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import MainLoading from '@/components/main/MainLoading.vue';
import AppPopup from '@/common/utils/popup/AppPopup.vue';

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

const isLoggedIn = computed(() => auth.loggedIn);

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

        layout.setlayoutHeight(height);
        isMobile.value = width <= 768;
    });

    resizeObserver.observe(appContainer.value);
};

// ==================================================
// Hook 영역
// ==================================================
watch(
    isLoggedIn,
    (isLoggedIn) => {
        // 인증 상태가 명확할 때만 리다이렉트 처리
        if (!isLoggedIn) {
            const targetPath = isMobile.value ? '/mlogin' : '/login';
            // 이미 로그인 페이지에 있다면 push를 막아 중복 라우팅 방지
            if (router.currentRoute.value.path !== targetPath) {
                router.push(targetPath);
            }
        }
    },
    { immediate: true },
);

onMounted(() => {
    setupResizeObserver();
});

onUnmounted(() => {
    resizeObserver?.disconnect();
});
</script>

<template>
    <div ref="appContainer" style="min-height: 100vh; background: #f0f0f0">
        <AppPopup />

        <MainLoading v-if="loading.isLoading" />

        <router-view />
    </div>
</template>
