<script setup lang="ts">
/*
 * @file     UI_USR_P02.vue
 * @menu     비밀번호 변경
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted, onActivated } from 'vue';
import { updatePassword } from '@/api/auth';

// ==================================================
// 변수 선언 영역
// ==================================================
// 메세지 변수
const { t } = useI18n();

// 부모 및 팝업 스토어에서 넘어오는 props 타입 선언 🌟
interface PopupProps {
    id?: string; // 스토어에서 생성된 고유 팝업 ID
    props?: {
        custId?: string;
        userId?: string;
        passwd?: string;
        [key: string]: any;
    };
}
const props = withDefaults(defineProps<PopupProps>(), {
    id: '',
    props: () => ({}),
});

const classObject = ref({
    eye1: 'pwd_eye_off',
    eye2: 'pwd_eye_off',
    pwdType1: 'password',
    pwdType2: 'password',
});

const pwdType1 = ref<any>(null);

// 비밀번호 입력 폼 데이터
const inputParamState = {
    inputPw: '',
    inputVPw: '',
};
const inputParam = ref({ ...inputParamState });

const popup = popupStore();

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
// 새 비밀번호 보기/숨기기 토글
const eyeChange1 = () => {
    if (classObject.value.eye1 === 'pwd_eye_off') {
        classObject.value.eye1 = 'pwd_eye_on';
        classObject.value.pwdType1 = 'text';
    } else {
        classObject.value.eye1 = 'pwd_eye_off';
        classObject.value.pwdType1 = 'password';
    }
};

// 새 비밀번호 확인 보기/숨기기 토글
const eyeChange2 = () => {
    if (classObject.value.eye2 === 'pwd_eye_off') {
        classObject.value.eye2 = 'pwd_eye_on';
        classObject.value.pwdType2 = 'text';
    } else {
        classObject.value.eye2 = 'pwd_eye_off';
        classObject.value.pwdType2 = 'password';
    }
};

// 비밀번호 변경 및 저장
const savePw = () => {
    if (!inputParam.value.inputPw || !inputParam.value.inputVPw) {
        popup.alert(t('com.message.inputItemL', [t('com.label.password')])); // 🌟 전역 스토어 alert로 대체 가능
        return;
    }

    if (inputParam.value.inputPw !== inputParam.value.inputVPw) {
        popup.alert(t('user.message.passwordNotMatched'));
        return;
    }

    if (inputParam.value.inputPw.length < 5) {
        popup.alert(t('com.message.inputMinLengthL', [t('com.label.password'), 5]));
        return;
    }

    // 변경 API 호출
    updatePassword({
        userId: props.props?.userId || '',
        passwd: inputParam.value.inputPw,
        orgPasswd: props.props?.passwd || '',
    })
        .then(() => {
            popup.alert(t('user.message.passwordChanged')).then(() => {
                // 🌟 확인 팝업창을 닫으면서 부모(LoginPage)에게 성공 신호(true)를 전달합니다.
                popup.closePopup(props.id, true);
            });
        })
        .catch((err) => {
            console.error('[UI_USR_P02] 패스워드 변경 실패:', err);
        });
};

// ==================================================
// Hook 영역
// ==================================================
onActivated(() => {
    inputParam.value = { ...inputParamState };
});

onMounted(() => {
    // 하위 인풋 컴포넌트에 focus 메서드가 구현되어 있다면 실행
    if (pwdType1.value && typeof pwdType1.value.setFocus === 'function') {
        pwdType1.value.setFocus();
    }
});
</script>

<template>
    <div id="main">
        <div class="popupContent">
            <h3 class="pwd_header">{{ t('user.label.passwordReset') }}</h3>
            <div class="pwd_form">
                <label>
                    <ComInput
                        ref="pwdType1"
                        v-model="inputParam.inputPw"
                        :type="classObject.pwdType1"
                        :params="{ inputClass: 'pwd_input' }"
                        :placeholder="t('user.label.newPassword')"
                        autocomplete="new-password"
                    />
                    <ComButton :class="classObject.eye1" :params="{}" @click="eyeChange1" />
                </label>
                <label>
                    <ComInput
                        v-model="inputParam.inputVPw"
                        :type="classObject.pwdType2"
                        :params="{ inputClass: 'pwd_input' }"
                        :placeholder="t('user.label.newPasswordConfirm')"
                    />
                    <ComButton :class="classObject.eye2" :params="{}" @click="eyeChange2" />
                </label>
            </div>
            <div>
                <ComButton
                    :params="{ name: t('com.label.confirm'), buttonClass: 'pwd_btn' }"
                    @click="savePw"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.pwd_header {
    font: 500 16px/18px 'Pretendard';
    width: 100%;
    text-align: center;
    font-size: 23px;
    color: #454545;
    margin-top: 20px;
    border: 0px none !important;
}

.eye-button {
    position: absolute;
    top: 50%;
    right: 40px;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
.pwd_form {
    text-align: center;
    margin-top: 34px;
}
label {
    position: relative;
    display: block;
    margin-bottom: 12px;
}
:deep(.pwd_input) {
    width: 90%;
    min-width: 90%;
    display: inline-block;
    border: 1px solid #c7c7c7;
    font: 500 16px/18px 'Pretendard';
    transition: all 0.2s ease;
    height: 40px;
    padding: 10px;
    position: relative;
    /* background: #fff url("/src/static/img/btn_pwd_off.svg") no-repeat right 10px center/25px 25px; */
    /* background: #fff; */
    color: #454545;
    border-radius: 5px;
    white-space: nowrap;
    margin-bottom: 15px;
    outline: none;
}

.pwd_btn {
    position: absolute;
    text-align: center;
    /* display: list-item; */
    margin: auto;
    /* margin-top: 200px; */
    cursor: pointer;
    /* bottom: 28px; */
    left: 50%;
    transform: translate(-50%, 0%);
    background: #98abcf;
    color: #fff;
    width: 90%;
    border-radius: 5px;
    font-size: 16px;
    height: 40px;
    /* padding-top: 6px; */
    font-weight: normal;
}

.pwd_btn:hover {
    color: #fff;
    background: #98abcf;
}

.pwd_eye {
    position: absolute;
    width: 40px;
    height: 40px;
    top: 0;
    bottom: 0;
    right: 5px;
    margin: auto 0;
    border-radius: 3px;
    /* background: url("/src/static/img/btn_pwd_off.svg") no-repeat right 10px center/25px 25px; */
}

.pwd_eye_off {
    background: url('/src/static/img/btn_pwd_off.svg') no-repeat right 6px center/25px 25px;
    position: absolute;
    width: 40px;
    height: 40px;
    top: 6px;
    right: 20px;
    margin: auto 0;
    border-radius: 3px;
}
.pwd_eye_off:hover {
    background: url('/src/static/img/btn_pwd_off.svg') no-repeat right 6px center/25px 25px;
    opacity: 0.6;
}

.pwd_eye_on {
    background: url('/src/static/img/btn_pwd_on.svg') no-repeat right 7px center/24px 24px;
    position: absolute;
    width: 40px;
    height: 40px;
    top: 6px;
    right: 20px;
    margin: auto 0;
    border-radius: 3px;
}
.pwd_eye_on:hover {
    background: url('/src/static/img/btn_pwd_on.svg') no-repeat right 7px center/24px 24px;
    opacity: 0.6;
}

.pwd_msg {
    font-size: 17px;
    width: 90%;
    line-height: 150%;
    display: block !important;
    margin: auto !important;
    text-align: left;
    margin-top: 0px !important;
    color: #454545;
}

#main {
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
}

.popupContent {
    width: 100% !important;
    max-width: 400px !important;
    padding: 40px !important;
    background: white !important;
    border-radius: 10px !important;
    /* box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2); */
}
</style>
