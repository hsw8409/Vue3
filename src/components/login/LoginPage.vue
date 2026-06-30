<script setup lang="ts">
/**
 * @file     LoginPage.vue
 * @menu     로그인화면
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted } from 'vue'; // vue 기본 기능
import { useRouter } from 'vue-router'; // 라우터
import { useI18n } from 'vue-i18n'; // 다국어

import { useAuthStore } from '@/common/stores/auth'; // 권한
import { usePopupStore } from '@/common/stores/popup'; // 팝업

import { utils } from '@/common/utils'; // 유틸

// ==================================================
// Type 선언 영역
// ==================================================
import type { UserProps } from '@/types/auth'; // 권한 타입

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
 * 로그인 버튼 이벤트
 *
 */
const onLogin = async () => {
    // localStorage에 아이디 저장
    if (saveUserId.value) {
        localStorage.setItem('savedId', userId.value);
    } else {
        localStorage.removeItem('savedId');
    }

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

/**
 * 로그인 처리
 *
 */
const authLogin = async (params: UserProps) => {
    // 로그인 시작 시 로그아웃 상태를 false로 설정
    auth.setLoggedOut(false);

    try {
        // 로그인 요청
        const res = await auth.login(params);

        // 비밀번호 초기화 대상인 경우
        if (res.resetTarget === '1') {
            popup.openPopup('biz', 'UI_USR_P02', {
                userId: userId.value,
                passwd: passwd.value,
                width: 600,
                height: 400,
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

        // {0} \n 로그인 중 오류가 발생했습니다.
        popup.alert(t('user.message.loginErr001', [err?.message]));
    }
};

// ==================================================
// Hook 영역
// ==================================================
onMounted(() => {
    // localStorage에 있는 사용자 ID가 있으면 자동으로 셋팅해준다.
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
                href="http://www.w3.org/1999/xlink"
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
                    <use href="#gentle-wave" x="48" y="0" fill="#990011cb" />
                    <use href="#gentle-wave" x="48" y="5" fill="#FCDEDEcb" />
                    <use href="#gentle-wave" x="48" y="3" fill="#FFD21Ecb" />
                </g>
            </svg>
        </div>
        <div class="LoginForm">
            <div class="LoginBox">
                <div class="program_name_login">Astems</div>
                <div class="logo"></div>
                <div class="Hgroup">
                    <div class="form_wrap">
                        <span class="form_cell form_input login">
                            <input
                                id="login_userId"
                                v-model="userId"
                                type="text"
                                :placeholder="t('com.label.id')"
                                maxlength="30"
                                @keyup.enter="onLogin"
                            />
                        </span>
                    </div>
                    <div class="form_wrap">
                        <span class="form_cell form_input login">
                            <input
                                id="login_password"
                                v-model="passwd"
                                type="password"
                                :placeholder="t('com.label.password')"
                                maxlength="30"
                                @keyup.enter="onLogin"
                            />
                        </span>
                    </div>
                </div>
                <div class="LoginMenu">
                    <div>
                        <div class="form_wrap">
                            <span class="form_cell form_check login">
                                <input id="check01" v-model="saveUserId" type="checkbox" />
                                <label for="check01">{{ t('user.label.idSave') }}</label>
                            </span>
                        </div>
                    </div>
                </div>
                <button type="button" class="LoginBtn" @click="onLogin">
                    <span>LOGIN</span>
                </button>
            </div>
        </div>
    </div>
</template>
