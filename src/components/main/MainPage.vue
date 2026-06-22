<script setup lang="ts">
/*
 * @file     mainPage.vue
 * @menu     메인페이지 vue
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, computed, provide, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { useAuthStore } from '@/common/stores/auth';
import { usePopupStore } from '@/common/stores/popup';

import MainHeader from '@/components/main/layout/MainHeader.vue';
import MainLeft from '@/components/main/layout/MainLeft.vue';
import MainTab from '@/components/main/layout/MainTab.vue';

import TokenService from '@/common/service/token';
import { selectComCd } from '@/api/main';

// 데이터 타입 인터페이스 정의
interface MenuItem {
    menuId: string | number;
    menuNm: string;
    [key: string]: any;
}

interface AxiosErrorProp {
    type: string;
    msg: string;
}

// 전역 emitter 확장을 위한 임시 타입 정의
type ExtendedPublicInstance = ComponentPublicInstance & {
    $emitter?: {
        on: (event: string, handler: (...args: any[]) => void) => void;
        off: (event: string, handler: (...args: any[]) => void) => void;
    };
};

// ==================================================
// 변수 선언 영역
// ==================================================
const authStore = useAuthStore();
const popup = usePopupStore();

const instance = getCurrentInstance();
const proxy = instance?.proxy as ExtendedPublicInstance | undefined;

const menuList = ref<MenuItem[]>([]);
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

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
const hideMenuToggled = (e: boolean) => {
    hideToggle.value = e;
    tabComponents.value?.layoutSizeChanged?.(e);
};

const goPage = (m: any) => {
    // 💡 방어 코드: menuList 데이터가 정상적으로 바인딩되었는지 체크
    if (!menuList.value || menuList.value.length === 0) {
        console.warn('메뉴  데이터가 아직 로드되지 않았습니다.');
        return;
    }

    // 안전하게 자식 컴포넌트(MainTab)의 addTab 메서드로 토스
    tabComponents.value?.addTab?.(m);
};

const menuListEmit = (m: any[]) => {
    menuList.value = m || [];
};

const axiosError = (prop: AxiosErrorProp) => {
    popup.alert(`[${prop.type}]\n${prop.msg}`);
};

const menuSet = (m: MenuItem | null) => {
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

// ==================================================
// Hook 영역
// ==================================================
onMounted(() => {
    const loginUser = TokenService.getUser();

    if (loginUser && Number(loginUser?.resetTarget) === 1) {
        authStore.logout();
    }

    if (proxy?.$emitter) {
        proxy.$emitter.on('errorMessageEvent', axiosError);
    }

    selectComCd().then((res: any) => {
        if (res?.result) {
            try {
                for (const key in res.result) {
                    if (Object.prototype.hasOwnProperty.call(res.result, key)) {
                        localStorage.setItem(key, JSON.stringify(res.result[key] ?? {}));
                    }
                }
            } catch (error) {
                console.error('공통 코드 공백 할당 중 스토리지 에러 발생:', error);
            }
        }
    });
});

onUnmounted(() => {
    if (proxy?.$emitter) {
        proxy.$emitter.off('errorMessageEvent', axiosError);
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
