<script setup lang="ts">
/*
 * @file     MainPage.vue
 * @menu     메인페이지 vue
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, computed, provide, onMounted, onUnmounted, inject } from 'vue';

import { useAuthStore } from '@/common/stores/auth';
import { usePopupStore } from '@/common/stores/popup';
import { useCommonCodeStore } from '@/common/stores/commonCode';
import { useMenuStore } from '@/common/stores/menu';
import { useFavoriteStore } from '@/common/stores/favorite';

import MainHeader from '@/components/main/layout/MainHeader.vue';
import MainLeft from '@/components/main/layout/MainLeft.vue';
import MainTab from '@/components/main/layout/MainTab.vue';

import TokenService from '@/common/service/token';

import type { Emitter } from 'mitt';

import type { MenuItemProps, SelectedMenuProps } from '@/types/menu';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================
interface AxiosErrorProp {
    type: string;
    msg: string;
}

interface MenuTabProps extends SelectedMenuProps {
    params?: Record<string, unknown>;
}

type GlobalEvent = {
    errorMessageEvent: AxiosErrorProp;
};

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
const authStore = useAuthStore();
const popupStore = usePopupStore();
const menuStore = useMenuStore();
const favStore = useFavoriteStore();
const commonCodeStore = useCommonCodeStore();

const emitter = inject<Emitter<GlobalEvent>>('emitter');

const hideToggle = ref(false);

const refMenuLeft = ref<InstanceType<typeof MainLeft> | null>(null);
const tabComponents = ref<InstanceType<typeof MainTab> | null>(null);

// ==================================================
// 하위 컴포넌트로 데이터 전송 (Provide)
// ==================================================
provide(
    'hideToggle',
    computed(() => hideToggle.value),
);
provide('loginUser', TokenService.getUser());

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const hideMenuToggled = (e: boolean) => {
    hideToggle.value = e;
};

const pageClick = (menu: MenuTabProps) => {
    tabComponents.value?.addTab(menu);
};

const axiosError = (prop: AxiosErrorProp) => {
    popupStore.alert(`[${prop.type}]\n${prop.msg}`);
};

const menuSet = (m: MenuItemProps) => {
    refMenuLeft.value?.menuTabSet(m);
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
onMounted(async () => {
    const loginUser = TokenService.getUser();

    if (!loginUser || !loginUser.userId) {
        return;
    }

    if (Number(loginUser.resetTarget) === 1) {
        authStore.logout();
        return;
    }

    if (emitter) {
        emitter.on('errorMessageEvent', axiosError);
    }

    // 공통코드, 메뉴, 즐겨찾기 목록을 가져옴
    try {
        await Promise.all([
            commonCodeStore.fetchAll(),
            menuStore.fetchMenuList({
                loginChainCd: loginUser.chainCd ?? '',
                loginId: loginUser.userId,
            }),
            favStore.fetchFavoriteList(loginUser.userId),
        ]);
    } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
    }
});

onUnmounted(() => {
    if (emitter) {
        emitter.off('errorMessageEvent', axiosError);
    }
});
</script>

<template>
    <div id="wrap">
        <MainHeader />
        <div id="main">
            <MainLeft
                ref="refMenuLeft"
                @hide-menu-toggled="hideMenuToggled"
                @page-click="pageClick"
            />
            <div id="contentW">
                <div id="content">
                    <MainTab ref="tabComponents" @menu-set="menuSet" />
                </div>
            </div>
        </div>
    </div>
</template>
