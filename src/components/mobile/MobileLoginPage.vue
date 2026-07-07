<script setup lang="ts">
/**
 * @file     MobileLogin.vue
 * @menu     모바일 로그인화면
 * @author   astems
 * @since    2026-07-01
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref } from 'vue'; // vue 기본 기능
import { useRouter } from 'vue-router'; // 라우터
import { useI18n } from 'vue-i18n'; // 다국어

import { useAuthStore } from '@/common/stores/auth'; // 권한
import { usePopupStore } from '@/common/stores/popup'; // 팝업

import { utils } from '@/common/utils'; // 유틸

import type { UserProps } from '@/types/auth'; // 권한 타입

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
const router = useRouter();
const { t } = useI18n();

const authStore = useAuthStore();
const popupStore = usePopupStore();

const userId = ref<string>('');
const passwd = ref<string>('');

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const doLogin = async () => {
    // 입력 검증
    const checkItems: any[] = [
        { name: t('com.label.userId'), value: userId.value, required: true },
        { name: t('com.label.password'), value: passwd.value, required: true },
    ];
    const isValid = await utils.validator.validateBeforeSubmit(checkItems, t);
    if (!isValid) return;

    authLogin({
        userId: userId.value,
        passwd: passwd.value,
    });
};

const authLogin = async (params: UserProps) => {
    // 로그인 시작 시 로그아웃 상태를 false로 설정
    authStore.setLoggedOut(false);

    try {
        // 로그인 요청
        const res = await authStore.login(params);

        if (res) {
            router.push('/main');
        }
    } catch (error) {
        const err = error as Error;

        // {0} \n 로그인 중 오류가 발생했습니다.
        popupStore.alert(t('user.message.loginErr001', [err?.message]));
    }
};
</script>
<template>
    <div id="login" class="mobile">
        <div class="LoginForm">
            <div class="LoginImg"></div>
            <p>mobile</p>
            <div class="LoginBox">
                <!-- <div class="logo"></div> -->
                <div class="Hgroup">
                    <div class="form_wrap">
                        <span class="form_cell form_input login">
                            <input v-model="userId" type="text" placeholder="아이디" required />
                        </span>
                    </div>
                    <div class="form_wrap">
                        <span class="form_cell form_input login">
                            <input
                                v-model="passwd"
                                type="password"
                                placeholder="비밀번호"
                                required
                            />
                        </span>
                    </div>
                </div>
                <div class="LoginMenu">
                    <div>
                        <div class="form_wrap">
                            <span class="form_cell form_check login">
                                <input id="check01" type="checkbox" />
                                <label for="check01" class="checkbox">
                                    <span>아이디 저장</span>
                                </label>
                            </span>
                        </div>
                    </div>
                </div>
                <button type="button" class="LoginBtn" @click="doLogin">
                    <span>LOGIN</span>
                </button>
            </div>
        </div>
    </div>
</template>
