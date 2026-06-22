<script setup lang="ts">
/*
 * @file     UI_USR_P03.vue
 * @menu     마이페이지
 * @author   astems
 * @since    2026-06-18
 * @version  1.0
 */

// =================================================================
// import 영역
// =================================================================
import { ref, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AddressFind from '@/components/etc/AddressFind.vue';
import EmailAddress from '@/components/etc/EmailAddress.vue';
import { updateMypage, updatePassword, selectUser } from '@/api/auth';
import { utils } from '@/common/utils';

// =================================================================
// Props & Emits 정의 (TypeScript 표준 가이드 적용)
// =================================================================
interface Props {
    param?: {
        userId?: string;
        userNm?: string;
        [key: string]: any;
    };
    params?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
    param: () => ({ userId: '', userNm: '' }),
    params: () => ({}),
});

const emit = defineEmits<{
    (e: 'okClick'): void;
    (e: 'openAlert', message: string): void;
}>();

// =================================================================
// 변수 선언 및 초기화 영역
// =================================================================
const { t } = useI18n();

// 카카오 주소 스크립트 중복 로드 방지 가드
if (!document.querySelector('script[src*="postcode.v2.js"]')) {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.body.appendChild(script);
}

const passwdForm = ref(false);
const emailFlag = ref('1');

const searchParameter = ref({
    userId: '',
    userNm: '',
});

const emailOptions = ref([
    'gmail.com',
    'naver.com',
    'daum.net',
    'hanmail.net',
    'nate.com',
    'korea.com',
    'chol.com',
    'dreamwiz.com',
    'empal.com',
    'hotmail.com',
]);

// 공통 폼 구조 팩토리 함수 (중복 선언 축소)
const createDefaultUserForm = () => ({
    userId: '',
    userNm: '',
    passwd: '',
    email: '',
    hpNo: '',
    telNo: '',
    formatHpNo: '',
    formatTelNo: '',
    roadDtlAddr: '',
    roadAddr: '',
    zipno: '',
    emailId: '',
    emailAddr: '',
});

const userForm = ref(createDefaultUserForm());
const resetUserForm = ref(createDefaultUserForm());
const passwd = ref<any>(null);

const classObjectState = {
    eye1: 'pwd_eye_off2',
    eye2: 'pwd_eye_off2',
    pwdType1: 'password',
    pwdType2: 'password',
};
const classObject = reactive({ ...classObjectState });

const inputParamState = {
    inputPw: '',
    inputVPw: '',
};
const inputParam = reactive({ ...inputParamState });

// =================================================================
// 사용자 정의 함수 영역
// =================================================================

const validateBeforeSubmit = async () => {
    const checkItems = [
        {
            name: t('com.label.userId'),
            value: userForm.value.userId,
            required: true,
            alphaNum: true,
            minLength: 4,
        },
        { name: t('com.label.password'), value: userForm.value.passwd, required: true },
        { name: t('com.label.initials'), value: userForm.value.userNm, required: true },
    ];

    return await utils.validator.validateBeforeSubmit(checkItems, t);
};

// 공백 및 null값 표준화 포맷터
const normalizeEmpty = (val: any) => (val ?? '').toString().trim();

const passwdChange = () => {
    inputParam.inputPw = '';
    inputParam.inputVPw = '';
    passwdForm.value = true;
};

// 수정된 데이터가 한 건이라도 존재하는지 체크
const countEdit = () => {
    const fields: Array<keyof typeof userForm.value> = [
        'userNm',
        'email',
        'hpNo',
        'zipno',
        'telNo',
        'roadDtlAddr',
        'roadAddr',
    ];

    const isEdited = fields.some(
        (field) =>
            normalizeEmpty(resetUserForm.value[field]) !== normalizeEmpty(userForm.value[field]),
    );

    if (!isEdited) {
        emit('openAlert', t('com.message.noDataToSave'));
        return false;
    }
    return true;
};

const save = async () => {
    if (!(await validateBeforeSubmit()) || !countEdit()) return false;

    updateMypage(userForm.value)
        .then((res: any) => {
            // 👈 : any 타입을 명시하여 에러를 해결합니다.
            emit('openAlert', res?.result);
            userForm.value.passwd = '';
        })
        .catch((e) => {
            emit('openAlert', e.message);
        });
};

const eyeChange1 = () => {
    const isOpen = classObject.eye1 === 'pwd_eye_off2';
    classObject.eye1 = isOpen ? 'pwd_eye_on2' : 'pwd_eye_off2';
    classObject.pwdType1 = isOpen ? 'text' : 'password';
};

const eyeChange2 = () => {
    const isOpen = classObject.eye2 === 'pwd_eye_off2';
    classObject.eye2 = isOpen ? 'pwd_eye_on2' : 'pwd_eye_off2';
    classObject.pwdType2 = isOpen ? 'text' : 'password';
};

const resetPasswd = () => {
    if (!inputParam.inputPw || !inputParam.inputVPw) {
        emit('openAlert', t('com.message.inputItemL', [t('com.label.password')]));
        return false;
    }
    if (inputParam.inputPw !== inputParam.inputVPw) {
        emit('openAlert', t('user.message.passwordNotMatched'));
        return false;
    }
    if (inputParam.inputPw.length < 5) {
        emit('openAlert', t('com.message.inputMinLengthL', [t('com.label.password'), 5]));
        return false;
    }

    updatePassword({ userId: userForm.value.userId, passwd: inputParam.inputPw })
        .then(() => {
            emit('openAlert', t('com.message.changed'));
            passwdForm.value = false;
        })
        .catch((e) => {
            emit('openAlert', e.message);
        });
};

const search = () => {
    if (!props.param?.userId) return;

    searchParameter.value.userId = props.param.userId;
    searchParameter.value.userNm = props.param.userNm || '';

    selectUser({ userId: searchParameter.value.userId })
        .then((res: any) => {
            // 👈 : any 타입을 명시하여 AxiosResponse 에러를 해결합니다.
            if (!res?.result) return;
            const data = res.result;

            // 데이터 맵핑 루프 처리 최적화
            const targetForms = [userForm, resetUserForm];
            targetForms.forEach((form) => {
                form.value.userId = data.userId;
                form.value.userNm = data.userNm;
                form.value.telNo = data.telNo;
                form.value.hpNo = data.hpNo;
                form.value.formatHpNo = data.hpNo;
                form.value.formatTelNo = data.telNo;
                form.value.zipno = data.zipno;
                form.value.roadAddr = data.roadAddr;
                form.value.roadDtlAddr = data.roadDtlAddr;
                form.value.email = data.email;
            });

            if (userForm.value.email) {
                const [emailId, emailAddr] = userForm.value.email.split('@');

                // 💡 각 변수 뒤에 ?? '' 를 붙여서 무조건 string 형식을 만족하게 만듭니다.
                const safeEmailId = emailId ?? '';
                const safeEmailAddr = emailAddr ?? '';

                userForm.value.emailId = safeEmailId;
                userForm.value.emailAddr = safeEmailAddr;
                resetUserForm.value.emailId = safeEmailId;
                resetUserForm.value.emailAddr = safeEmailAddr;

                // 기존 복잡한 옵션 검색 로직 단축 (안전해진 safeEmailAddr 활용)
                emailFlag.value = emailOptions.value.includes(safeEmailAddr) ? safeEmailAddr : '';
            }
        })
        .catch((e) => {
            console.error(e);
        });
};

// =================================================================
// Hook & Watch 영역 (새로 만든 biz 유틸 바인딩 적용 위치)
// =================================================================
onMounted(() => {
    search();
    passwd.value?.setFocus();
});

watch(
    () => userForm.value.formatTelNo,
    (newVal) => {
        if (!newVal) return;
        // 아까 만든 공통 유틸 함수가 들어가는 포인트입니다!
        const formatted = utils.stringUtil.getFormatTelNo(newVal);
        if (userForm.value.formatTelNo !== formatted) {
            userForm.value.formatTelNo = formatted;
        }
        userForm.value.telNo = formatted.replace(/\D/g, '');
    },
);

watch(
    () => userForm.value.formatHpNo,
    (newVal) => {
        if (!newVal) return;
        const formatted = utils.stringUtil.getFormatTelNo(newVal);
        if (userForm.value.formatHpNo !== formatted) {
            userForm.value.formatHpNo = formatted;
        }
        userForm.value.hpNo = formatted.replace(/\D/g, '');
    },
);
</script>

<template>
    <div id="main">
        <div id="container" class="popupContent">
            <div class="titleWrap">
                <div class="pageTitle">
                    <!--마이페이지-->
                    <h2>회원정보 수정</h2>
                </div>
                <div class="btn_area">
                    <ComButton :params="{ name: t('com.label.save') }" @click="save" />
                </div>
            </div>
            <table class="tableLayout">
                <colgroup>
                    <col style="width: 15%" />
                    <col style="width: 35%" />
                    <col style="width: 15%" />
                    <col style="width: 35%" />
                </colgroup>
                <tbody>
                    <tr>
                        <!-- 사용자ID -->
                        <th>* {{ t('com.label.userId') }}</th>
                        <td colspan="3">
                            <div class="flex">
                                <div class="form_wrap from_wrap_mypage">
                                    <ComInput v-model="userForm.userId" type="text" readonly />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <!-- 비밀번호 -->
                        <th>* {{ t('com.label.password') }}</th>
                        <td colspan="3">
                            <div class="flex password">
                                <div class="form_wrap">
                                    <ComInput
                                        ref="passwd"
                                        v-model="userForm.passwd"
                                        type="password"
                                        autocomplete="new-password"
                                        :params="{ inputClass: 'auto' }"
                                    />
                                    <ComButton
                                        :params="{ name: t('user.label.passwordChange') }"
                                        @click="passwdChange"
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <!-- 이름 -->
                        <th>* {{ t('com.label.initials') }}</th>
                        <td colspan="3">
                            <div class="form_wrap from_wrap_mypage">
                                <ComInput v-model="userForm.userNm" type="text" />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <!-- 집 전화번호 -->
                        <th>{{ t('user.label.homeTelNo') }}</th>
                        <td class="small">
                            <div class="form_wrap from_wrap_mypage">
                                <ComInput v-model="userForm.formatTelNo" type="text" />
                            </div>
                        </td>
                        <!--핸드폰번호-->
                        <th>{{ t('com.label.hpNo') }}</th>
                        <td class="small">
                            <div class="form_wrap from_wrap_mypage">
                                <ComInput v-model="userForm.formatHpNo" type="text" />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <!--주소-->
                        <th>{{ t('com.label.address') }}</th>
                        <td colspan="3">
                            <AddressFind v-model="userForm" :params="{ popupYn: true }" />
                        </td>
                    </tr>
                    <tr>
                        <!--이메일주소-->
                        <th>{{ t('user.label.emailAddress') }}</th>
                        <td colspan="3">
                            <EmailAddress v-model="userForm.email" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="passwdForm" class="msg-background">
                <div class="modal-msg">
                    <div class="pwd_close" @click="passwdForm = false">x</div>
                    <!-- 비밀번호 재설정 -->
                    <h3 class="pwd_header">{{ t('user.label.passwordReset') }}</h3>
                    <div class="pwd_form">
                        <label style="position: relative">
                            <!--새 비밀번호-->
                            <ComInput
                                v-model="inputParam.inputPw"
                                :type="classObject.pwdType1"
                                :params="{ inputClass: 'pwd_input' }"
                                :placeholder="t('user.label.newPassword')"
                                autocomplete="new-password"
                            />
                            <ComButton :class="classObject.eye1" :params="{}" @click="eyeChange1" />
                        </label>
                        <label style="position: relative">
                            <!--새비밀번호 확인-->
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
                        <!-- 확인 -->
                        <ComButton
                            :params="{ name: t('com.label.confirm'), buttonClass: 'pwd_btn' }"
                            @click="resetPasswd"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* =================================================================
 * 💡 가로 스크롤 완벽 대응을 위한 최외곽 구조 고정
 * ================================================================= */
#main {
    width: 100%;
    min-width: 740px; /* 👈 부모 팝업 바디 패딩을 고려한 자식 콘텐츠 최소 너비 강제 */
    height: auto;
    min-height: min-content;
    display: flow-root; /* 마진 병합 버그 방지 */
}

#container.popupContent {
    padding: 0 4px;
    height: auto;
    min-height: min-content;
    box-sizing: border-box;
}

/* 2. 타이틀 영역 마진 다듬기 */
.titleWrap {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pageTitle h2 {
    margin: 0; /* 기본 h2 마진 제거로 상단 튀는 현상 방지 */
}

/* 3. 테이블 레이아웃 고정 가이드 (가로 스크롤 생성 핵심) */
.tableLayout {
    width: 100% !important;
    min-width: 740px; /* 👈 테이블 구조가 일정 크기 이하로 무너지지 않도록 방어 */
    border-collapse: collapse;
    margin-bottom: 4px; /* 하단 여백 최소화 */
}

/* 4. 비밀번호 재설정 영역 */
.msg-background {
    position: relative;
    width: 100%;
    min-width: 740px; /* 👈 아래 비밀번호 창도 테이블과 가로폭 싱크 맞춤 */
    margin-top: 20px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    box-sizing: border-box;
}

/* 기존 마이페이지 스타일 보존 및 보정 코드 */
.pwd_header {
    font: 500 16px/18px 'Pretendard';
    width: 100%;
    text-align: center;
    font-size: 23px;
    color: #454545;
    margin-top: 30px;
    border: 0px none !important;
}

.pwd_form {
    text-align: center;
    margin-top: 34px;
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
    color: #454545;
    border-radius: 5px;
    white-space: nowrap;
    margin-bottom: 15px;
    outline: none;
}

.msg-background + div,
.modal-msg > div:last-child {
    display: flex;
    justify-content: center;
    width: 100%;
}

.pwd_btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0 0 0;
    width: 90%;
    max-width: 320px;
    background: #98abcf;
    color: #fff;
    border-radius: 5px;
    font-size: 16px;
    height: 40px;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
}

.pwd_btn:hover {
    background: #7e93b8;
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
}

.pwd_eye_off2 {
    background: url('/src/static/img/btn_pwd_off.svg') no-repeat right 6px center/25px 25px;
    position: absolute;
    min-width: 40px;
    height: 40px;
    top: -21px;
    right: 6px;
    margin: auto 0;
    border-radius: 3px;
}
.pwd_eye_off2:hover {
    background: url('/src/static/img/btn_pwd_off.svg') no-repeat right 6px center/25px 25px;
    opacity: 0.6;
}

.pwd_eye_on2 {
    background: url('/src/static/img/btn_pwd_on.svg') no-repeat right 7px center/24px 24px;
    position: absolute;
    min-width: 40px;
    height: 40px;
    top: -21px;
    right: 6px;
    margin: auto 0;
    border-radius: 3px;
}
.pwd_eye_on2:hover {
    background: url('/src/static/img/btn_pwd_on.svg') no-repeat right 7px center/24px 24px;
    opacity: 0.6;
}

.modal-msg {
    position: relative;
    width: 100%;
    background: transparent;
    box-shadow: none;
    padding: 0;
}

.pwd_close {
    font-size: 30px;
    float: right;
    width: 30px;
    cursor: pointer;
    height: 30px;
}

.w-full {
    width: 100% !important;
    min-width: 100px;
    box-sizing: border-box;
}

.road_name {
    width: 250px !important;
}

.from_wrap_mypage {
    width: auto !important;
}

.flex.password {
    width: 44.5% !important;
}
</style>
