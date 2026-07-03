<script setup lang="ts">
/*
 * @file     mainPage.vue
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

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
const auth = useAuthStore();
const popup = usePopupStore();
const commonCodeStore = useCommonCodeStore();

const emitter = inject<Emitter<Record<string, any>>>('emitter');

const menuList = ref<MenuItemProps[]>([]);
const hideToggle = ref(false);

const refMenuLeft = ref<InstanceType<typeof MainLeft> | null>(null);
const tabComponents = ref<InstanceType<typeof MainTab> | null>(null);

// ==================================================
// 하위 컴포넌트로 데이터 전송 (Provide)
// ==================================================
provide(
    'menuList',
    computed(() => menuList.value),
);
provide(
    'hideToggle',
    computed(() => hideToggle.value),
);
provide('loginUser', TokenService.getUser() || {});

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const hideMenuToggled = (e: boolean) => {
    hideToggle.value = e;
    tabComponents.value?.layoutSizeChanged?.(e);
};

const goPage = (m: SelectedMenuProps) => {
    // 💡 방어 코드: menuList 데이터가 정상적으로 바인딩되었는지 체크
    if (!menuList.value || menuList.value.length === 0) {
        console.warn('메뉴  데이터가 아직 로드되지 않았습니다.');
        return;
    }

    // 안전하게 자식 컴포넌트(MainTab)의 addTab 메서드로 토스
    tabComponents.value?.addTab?.(m);
};

const menuListEmit = (m: MenuItemProps[]) => {
    menuList.value = m || [];
};

const axiosError = (prop: AxiosErrorProp) => {
    popup.alert(`[${prop.type}]\n${prop.msg}`);
};

const menuSet = (m: MenuItemProps | null) => {
    if (!m) {
        console.log('홈 화면으로 이동하여 메뉴 선택을 해제합니다.');
        return;
    }

    if (refMenuLeft.value?.menuTabSet) {
        refMenuLeft.value.menuTabSet(m);
    } else {
        console.warn('MainLeft 컴포넌트의 menuTabSet 함수가 준비되지 않았습니다.');
    }
};

const favoriteToggleEmit = (b: boolean) => {
    refMenuLeft.value?.favoriteToggle?.(b);
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
onMounted(async () => {
    const loginUser = TokenService.getUser();

    if (loginUser && Number(loginUser?.resetTarget) === 1) {
        auth.logout();
        return;
    }

    if (emitter) {
        emitter.on('errorMessageEvent', axiosError);
    }

    // ⭐ 핵심: 공통코드 로딩
    await commonCodeStore.fetchAll();
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
                @page-click="goPage"
                @hide-menu-toggled="hideMenuToggled"
                @menu-list-emit="menuListEmit"
            />
            <div id="contentW">
                <div id="content">
                    <MainTab
                        ref="tabComponents"
                        @menu-set="menuSet"
                        @favorite-toggle-emit="favoriteToggleEmit"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
