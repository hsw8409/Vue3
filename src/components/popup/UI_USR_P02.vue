<script setup lang="ts">
/**
 * @file     UI_USR_P02.vue
 * @menu     비밀번호 변경 팝업
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, nextTick, onActivated, reactive } from 'vue'; // vue 기본 기능
import { useI18n } from 'vue-i18n'; // 다국어

import { usePopupStore } from '@/common/stores/popup'; // 팝업

import { updatePassword } from '@/api/auth'; // api

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
const { t } = useI18n();
const popupStore = usePopupStore();

const props = defineProps<{
    id: string;
    userId?: string;
    passwd?: string;
    onOk?: () => void | Promise<void>;
}>();

// 비밀번호 보기/숨기기 상태 관리
const state = reactive({
    pwd1: { type: 'password', icon: 'pwd_eye_off' },
    pwd2: { type: 'password', icon: 'pwd_eye_off' },
});

const inputParam = reactive({
    inputPw: '',
    inputVPw: '',
});

const pwdInput1 = ref<HTMLInputElement | null>(null);

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
/**
 * 비밀번호 보기/숨기기 이벤트
 *
 */
const toggleEye = (target: 'pwd1' | 'pwd2') => {
    const s = state[target];
    s.type = s.type === 'password' ? 'text' : 'password';
    s.icon = s.icon === 'pwd_eye_off' ? 'pwd_eye_on' : 'pwd_eye_off';
};

/**
 * 비밀번호 변경
 *
 */
const savePw = () => {
    if (!inputParam.inputPw || !inputParam.inputVPw) {
        // 비밀번호를 입력해주세요.
        popupStore.alert(t('com.message.inputItemL', [t('com.label.password')]));
        return;
    }
    if (inputParam.inputPw !== inputParam.inputVPw) {
        // 비밀번호가 일치하지 않습니다.
        popupStore.alert(t('user.message.passwordNotMatched'));
        return;
    }
    if (inputParam.inputPw.length < 5) {
        // 비밀번호를 5자 이상 입력해주세요.
        popupStore.alert(t('com.message.inputMinLengthL', [t('com.label.password'), 5]));
        return;
    }

    updatePassword({
        userId: props.userId || '',
        passwd: inputParam.inputPw,
        orgPasswd: props.passwd || '',
    })
        .then(() => {
            popupStore.alert(t('user.message.passwordChanged'), '알림', {
                onOk: async () => {
                    await props.onOk?.();
                    popupStore.closePopup(props.id);
                },
            });
        })
        .catch((e) => {
            popupStore.alert(e.message);
        });
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
onActivated(() => {
    inputParam.inputPw = '';
    inputParam.inputVPw = '';

    state.pwd1.type = 'password';
    state.pwd1.icon = 'pwd_eye_off';

    state.pwd2.type = 'password';
    state.pwd2.icon = 'pwd_eye_off';
});

nextTick(() => {
    pwdInput1.value?.focus();
});
</script>

<template>
    <div id="main">
        <div class="popupContent">
            <h3 class="pwd_header">{{ t('user.label.passwordReset') }}</h3>
            <div class="pwd_form">
                <label class="pwd_label">
                    <input
                        ref="pwdInput1"
                        v-model="inputParam.inputPw"
                        :type="state.pwd1.type"
                        class="pwd_input"
                        :placeholder="t('user.label.newPassword')"
                        autocomplete="new-password"
                        maxlength="30"
                    />
                    <button
                        type="button"
                        :class="state.pwd1.icon"
                        @click="toggleEye('pwd1')"
                    ></button>
                </label>
                <label class="pwd_label">
                    <input
                        v-model="inputParam.inputVPw"
                        :type="state.pwd2.type"
                        class="pwd_input"
                        :placeholder="t('user.label.newPasswordConfirm')"
                        autocomplete="new-password"
                        maxlength="30"
                    />
                    <button
                        type="button"
                        :class="state.pwd2.icon"
                        @click="toggleEye('pwd2')"
                    ></button>
                </label>
            </div>
            <div>
                <button type="button" class="pwd_btn" @click="savePw">
                    {{ t('com.label.confirm') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pwd_header {
    font-size: 23px;
    color: #454545;
    margin: 20px 0;
    text-align: center;
}

.pwd_form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 34px;
}

.pwd_label {
    position: relative;
    display: flex;
    align-items: center;
    width: 90%;
    margin-bottom: 15px;
}

.pwd_input {
    flex: 1;
    height: 40px;
    padding: 0 45px 0 10px;
    border: 1px solid #c7c7c7;
    border-radius: 5px;
    box-sizing: border-box;
    outline: none;
    font: 500 16px 'Pretendard';
}

[class*='pwd_eye'] {
    position: absolute;
    right: 5px;
    width: 35px;
    height: 35px;
    border: none;
    cursor: pointer;
    background-size: 25px;
    background-position: center;
    background-repeat: no-repeat;
    background-color: transparent;
}

.pwd_eye_off {
    background-image: url('@/static/img/btn_pwd_off.svg');
}
.pwd_eye_on {
    background-image: url('@/static/img/btn_pwd_on.svg');
}

.pwd_btn {
    /* ✅ 추가: 정상적인 문서 흐름으로 배치 */
    display: block;
    margin: 20px auto 0; /* 상단 여백 20px, 좌우 자동 정렬 */
    cursor: pointer;
    background: #c99696;
    color: #fff;
    width: 90%; /* 부모 너비의 90% */
    border-radius: 5px;
    font-size: 16px;
    height: 40px;
    border: none;
    font-weight: normal;

    /* 텍스트 중앙 정렬 보장 */
    text-align: center;
    line-height: 40px;
}

#main {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.popupContent {
    width: 100%;
    padding: 40px;
    background: white;
    border-radius: 10px;
    box-sizing: border-box;
}
</style>
