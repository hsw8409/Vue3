<script setup lang="ts">
/*
 * @file      App.vue
 * @menu      Root 컴포넌트
 * @author    astems
 * @since     2026-06-15
 * @version   1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import Loading from '@/components/main/MainLoading.vue';
import AppPopup from '@/common/utils/popup/AppPopup.vue';
import { useLayoutStore } from '@/common/stores/layout';
import { useAuthStore } from '@/common/stores/auth';
import { useLoadingStore } from '@/common/stores/loadingState';

// ==================================================
// 변수 선언 영역
// ==================================================
const router = useRouter();
const layoutStore = useLayoutStore();
const auth = useAuthStore();
const loadingStore = useLoadingStore();

const appContainer = ref<HTMLElement | null>(null);
const isMobile = ref(false);

let resizeObserver: ResizeObserver | null = null;

const isLoggedIn = computed(() => auth.loggedIn);

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
const setupResizeObserver = () => {
    if (!appContainer.value) return;

    resizeObserver?.disconnect();

    resizeObserver = new ResizeObserver((item) => {
        const entry = item[0];
        if (!entry) return;

        const { width, height } = entry.contentRect;

        layoutStore.setlayoutHeight(height);
        isMobile.value = width <= 768;
    });

    resizeObserver.observe(appContainer.value);
};

// ==================================================
// Hook 영역
// ==================================================
watch(
    isLoggedIn,
    (cur) => {
        if (!cur) {
            router.push(isMobile.value ? '/mlogin' : '/login');
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

        <Loading v-if="loadingStore.isLoading" />

        <router-view />
    </div>
</template>
