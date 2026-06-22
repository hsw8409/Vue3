<script setup lang="ts">
/*
 * @file     LoginPage.vue
 * @menu     로그인화면
 * @author   astems
 * @since    2026-06-16
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/common/stores/auth';
import { usePopupStore } from '@/common/stores/popup';
import { utils } from '@/common/utils';

import type { UserReqProps } from '@/types/auth';
import type { ValidateProps } from '@/types/validate';

// ==================================================
// Type 선언 영역
// ==================================================

// ==================================================
// 변수 선언 영역
// ==================================================
const router = useRouter();
const { t } = useI18n();

const auth = useAuthStore();
const popup = usePopupStore();
const userId = ref<string>('');
const passwd = ref<string>('');
const saveUserId = ref<boolean>(false);

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

/**
 * 로그인 이벤트
 *
 * @param
 */
const doLogin = async () => {
    if (saveUserId.value) {
        localStorage.setItem('savedId', userId.value);
    } else {
        localStorage.removeItem('savedId');
    }

    const checkItems: ValidateProps[] = [
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

/**
 * 로그인 처리
 *
 * @param userId 사용자아이디
 * @param passwd 비밀번호
 */
const authLogin = async (params: UserReqProps) => {
    // 1. 로그인 시작 시 로그아웃 상태를 false로 설정 (기존 소스 동일)
    auth.setLoggedOut(false);

    try {
        // 2. Pinia의 login 액션 호출
        const res = await auth.login(params);

        // 3. 로그인 성공 시 로그아웃 상태를 다시 false로 확정 (기존 소스 동일)
        auth.setLoggedOut(false);

        // 비밀번호 초기화 대상인 경우
        if (res.resetTarget === 1) {
            await popup.openPopup('biz', 'UI_USR_P02', {
                userId: userId.value,
                passwd: passwd.value,
            });
            return;
        }

        // 디바이스 분기 및 페이지 이동
        const ua = navigator.userAgent;
        if (/iPhone|Android/.test(ua)) {
            router.push('/mobile');
        } else {
            router.push('/main');
        }
    } catch (error) {
        const err = error as Error;

        // 로그인 에러 발생 시 메시지 팝업 호출
        popup.alert(t('user.message.errorOccurredWhileLogin', [err?.message]));
    }
};

// ==================================================
// Hook 영역
// ==================================================
onMounted(() => {
    const savedUserId = localStorage.getItem('savedId');

    if (savedUserId) {
        userId.value = savedUserId;
        saveUserId.value = true;
    }
});
</script>

<template>
    <div id="login">
        <div class="boxx">
            <svg
                class="waves"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
                shape-rendering="auto"
            >
                <defs>
                    <path
                        id="gentle-wave"
                        d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                    />
                </defs>
                <g class="parallax">
                    <use xlink:href="#gentle-wave" x="48" y="0" fill="#990011cb" />
                    <use xlink:href="#gentle-wave" x="48" y="5" fill="#FCDEDEcb" />
                    <use xlink:href="#gentle-wave" x="48" y="3" fill="#FFD21Ecb" />
                </g>
            </svg>
        </div>
        <div class="LoginForm">
            <div class="LoginBox">
                <div class="program_name_login">Astems</div>
                <div class="logo"></div>
                <div class="Hgroup">
                    <div class="form_wrap">
                        <ComInput
                            v-model="userId"
                            :params="{ spanClass: 'form_cell form_input login' }"
                            :placeholder="t('com.label.id')"
                            @enter="doLogin"
                        />
                    </div>
                    <div class="form_wrap">
                        <ComInput
                            v-model="passwd"
                            :params="{ spanClass: 'form_cell form_input login' }"
                            type="password"
                            :placeholder="t('com.label.password')"
                            @enter="doLogin"
                        />
                    </div>
                </div>
                <div class="LoginMenu">
                    <div>
                        <div class="form_wrap">
                            <ComCheckbox
                                v-model="saveUserId"
                                :params="{
                                    label: t('user.label.idSave'),
                                    labelFor: 'check01',
                                    spanClass: 'form_cell form_check login',
                                }"
                            />
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
