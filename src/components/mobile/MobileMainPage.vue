<script setup lang="ts">
/**
 * @file     MobileMainPage.vue
 * @menu     모바일 메인페이지
 * @author   astems
 * @since    2026-07-01
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted, onUnmounted, inject, type Component } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/common/stores/auth';
import { usePopupStore } from '@/common/stores/popup';

import TokenService from '@/common/service/token';

import UI_MOB_002 from '@/views/mobile/UI_MOB_002.vue';

import MENU from '@/components/mobile/MobileMenuPage.vue';

import type { Emitter } from 'mitt';

import { selectComCd } from '@/api/main';

// ==================================================
// Type 선언 영역
// ==================================================

interface AxiosErrorProp {
    type: string;
    msg: string;
}

// ==================================================
// 변수 선언 영역
// ==================================================
const auth = useAuthStore();
const popup = usePopupStore();

const emitter = inject<Emitter<Record<string, any>>>('emitter');

const router = useRouter();
const userNm = ref('');
const currentComponent = ref('MENU');
const beforeComponent = ref('MENU');
const propsData = ref({});
const tabs = ref<string[]>([]);

const componentMap: Record<string, Component> = {
    MENU,
    UI_MOB_002,
};

const goPage = (param: any) => {
    const name = param.target?._value || param.target;

    currentComponent.value = name;

    if (!tabs.value.includes(name)) {
        tabs.value.push(name);
    }

    beforeComponent.value = name && name.length > 10 ? name.substring(0, 10) : 'MENU';

    propsData.value = param?.props ?? {};
};

const goBack = () => {
    currentComponent.value = beforeComponent.value;

    if (['UI_MOB_002'].includes(currentComponent.value)) {
        beforeComponent.value = 'MENU';
    }
};

const success = () => {
    currentComponent.value = currentComponent.value.substring(0, 10);

    tabs.value = [currentComponent.value];

    beforeComponent.value = 'MENU';
};

const logout = () => {
    // 💡 이전 팝업 스토어 규격(세 번째 인자 옵션 객체)에 맞춰 확실하게 바인딩
    popup.confirm('로그아웃 하시겠습니까?', undefined, {
        onOk: async () => {
            try {
                await auth.logout();
                // 모든 활성화된 팝업이 있다면 일괄 닫기(선택 사항) 후 이동
                router.push('/mlogin');
            } catch (error) {
                console.error('Logout Error:', error);
            }
        },
    });
};

const axiosError = (prop: AxiosErrorProp) => {
    popup.alert(`[${prop.type}]\n${prop.msg}`);
};

onMounted(async () => {
    const loginUser = TokenService.getUser();

    if (loginUser && Number(loginUser?.resetTarget) === 1) {
        auth.logout();
    }

    selectComCd().then((res) => {
        const result = res.data?.result; // 서버에서 보낸 실제 데이터

        if (result) {
            try {
                Object.keys(result).forEach((key) => {
                    const typedKey = key as keyof typeof result;
                    const value = result[typedKey] ?? {};
                    localStorage.setItem(key, JSON.stringify(value));
                });
            } catch (error) {
                if ((error as DOMException).name === 'QuotaExceededError') {
                    console.error('localStorage 용량이 초과되었습니다.');
                    // 필요시 일부 데이터 삭제 로직 추가
                } else {
                    console.error('스토리지 저장 실패:', error);
                }
            }
        }
    });
});

onUnmounted(() => {
    if (emitter) {
        emitter.off('errorMessageEvent', axiosError);
    }
});
</script>
<template>
    <div id="mobileHeader" class="btn_area_m">
        <div class="displayFlex">
            <button type="button" class="mobileBack" @click="goBack">
                <span>뒤로가기</span>
            </button>

            <div class="displayFlex">
                <div class="userImg"></div>

                <span class="userNm">
                    {{ userNm }}
                </span>
            </div>
        </div>

        <div class="displayFlex">
            <button type="button" class="logoutBorder" @click.prevent="logout">
                <div class="logoutImg"></div>
            </button>
        </div>
    </div>

    <div id="wrapM">
        <suspense>
            <template #default>
                <keep-alive :include="tabs">
                    <component
                        :is="componentMap[currentComponent]"
                        :props="propsData"
                        @go-page="goPage"
                        @go-page:success="success"
                        @go-back="goBack"
                    />
                </keep-alive>
            </template>

            <template #fallback>
                <div>Loading...</div>
            </template>
        </suspense>
    </div>
</template>
