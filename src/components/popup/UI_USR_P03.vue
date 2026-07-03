<script setup lang="ts">
/**
 * @file     /components/popup/UI_USR_P03.vue
 * @menu     마이페이지
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, computed, onMounted, watch, reactive } from 'vue';
import AddressFind from '@/components/etc/AddressFind.vue';
import EmailAddress from '@/components/etc/EmailAddress.vue';
import { updateMypage, selectUser } from '@/api/auth';
import { utils } from '@/common/utils';
import { useI18n } from 'vue-i18n';

import { usePopupStore } from '@/common/stores/popup';

import ComInputbox from '@/components/form/ComInputbox.vue';
import ComButton from '@/components/form/ComButton.vue';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================
interface UserForm {
    userId: string;
    userNm: string;
    passwd: string;
    email: string;
    hpNo: string;
    telNo: string;
    formatHpNo: string;
    formatTelNo: string;
    roadDtlAddr: string;
    roadAddr: string;
    zipno: string;
    emailId: string;
    emailAddr: string;
}

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
const { t } = useI18n();
const popup = usePopupStore();

const props = defineProps<{
    id: string;
    userId?: string;
    onOk?: () => void | Promise<void>;
}>();

const createDefaultUserForm = (): UserForm => ({
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

const userForm = ref<UserForm>(createDefaultUserForm());
const resetUserForm = reactive<UserForm>(createDefaultUserForm());
const addressInfo = computed({
    get: () => ({
        zipno: userForm.value.zipno,
        roadAddr: userForm.value.roadAddr,
        roadDtlAddr: userForm.value.roadDtlAddr,
    }),

    set: (value) => {
        userForm.value.zipno = value.zipno ?? '';
        userForm.value.roadAddr = value.roadAddr ?? '';
        userForm.value.roadDtlAddr = value.roadDtlAddr ?? '';
    },
});

const normalizeEmpty = (value: unknown) => (value ?? '').toString().trim();

const editableFields: (keyof UserForm)[] = [
    'userNm',
    'email',
    'hpNo',
    'telNo',
    'zipno',
    'roadAddr',
    'roadDtlAddr',
];

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
/**
 * validator
 *
 */
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
    return utils.validator.validateBeforeSubmit(checkItems, t);
};
/**
 * 수정여부 체크
 *
 */
const isEdited = () => {
    const changed = editableFields.some(
        (field) => normalizeEmpty(resetUserForm[field]) !== normalizeEmpty(userForm.value[field]),
    );
    if (!changed) {
        popup.alert(t('com.message.noDataToSave'));
        return false;
    }
    return true;
};

/**
 * 저장
 *
 */
const save = async () => {
    if (!(await validateBeforeSubmit())) return;
    if (!isEdited()) return;

    try {
        const res = await updateMypage(userForm.value);
        popup.alert(res?.data?.result);

        // 부모에서 후처리가 필요하면 호출
        await props.onOk?.();

        // 현재 팝업 닫기
        popup.closePopup(props.id);
    } catch (e: any) {
        popup.alert(e.message);
    }
};

/**
 * 회원정보매핑
 *
 */
const mappingUserData = (data: any): UserForm => ({
    ...createDefaultUserForm(),
    userId: data.userId ?? '',
    userNm: data.userNm ?? '',
    telNo: data.telNo ?? '',
    hpNo: data.hpNo ?? '',
    formatHpNo: data.hpNo ?? '',
    formatTelNo: data.telNo ?? '',
    zipno: data.zipno ?? '',
    roadAddr: data.roadAddr ?? '',
    roadDtlAddr: data.roadDtlAddr ?? '',
    email: data.email ?? '',
});

/**
 * 회원정보 조회
 *
 */
const search = async () => {
    if (!props.userId) return;

    try {
        const res = await selectUser({ userId: props.userId });
        if (!res?.data?.result) return;
        const formData = mappingUserData(res.data.result);
        userForm.value = structuredClone(formData);
        Object.assign(resetUserForm, structuredClone(formData));
    } catch (e: any) {
        popup.alert(e.message);
    }
};
const bindPhoneFormatter = (source: 'formatTelNo' | 'formatHpNo', target: 'telNo' | 'hpNo') => {
    watch(
        () => userForm.value[source],
        (value) => {
            if (!value) return;
            const formatted = utils.stringUtil.getFormatTelNo(value);
            if (userForm.value[source] !== formatted) {
                userForm.value[source] = formatted;
            }
            userForm.value[target] = formatted.replace(/\D/g, '');
        },
    );
};

bindPhoneFormatter('formatTelNo', 'telNo');
bindPhoneFormatter('formatHpNo', 'hpNo');

/**
 * 비밀번호 변경 팝업
 *
 */
const openPasswordPopup = () => {
    popup.openPopup('biz', 'UI_USR_P02', {
        userId: userForm.value.userId,
        passwd: userForm.value.passwd,
        width: 600,
        height: 400,
        onOk: () => {
            userForm.value.passwd = '';
        },
    });
    return;
};

// =====================================================================================================
// Hook 영역
// =====================================================================================================
onMounted(() => {
    search();
});
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
                    <ComButton :text="t('com.label.save')" @click="save" />
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
                                    <ComInputbox v-model="userForm.userId" type="text" readonly />
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
                                    <ComInputbox
                                        ref="passwd"
                                        v-model="userForm.passwd"
                                        type="password"
                                        autocomplete="new-password"
                                    />
                                    <ComButton
                                        :text="t('user.label.passwordChange')"
                                        @click="openPasswordPopup"
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
                                <ComInputbox v-model="userForm.userNm" type="text" />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <!-- 집 전화번호 -->
                        <th>{{ t('user.label.homeTelNo') }}</th>
                        <td class="small">
                            <div class="form_wrap from_wrap_mypage">
                                <ComInputbox v-model="userForm.formatTelNo" type="text" />
                            </div>
                        </td>
                        <!--핸드폰번호-->
                        <th>{{ t('com.label.hpNo') }}</th>
                        <td class="small">
                            <div class="form_wrap from_wrap_mypage">
                                <ComInputbox v-model="userForm.formatHpNo" type="text" />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <!--주소-->
                        <th>{{ t('com.label.address') }}</th>
                        <td colspan="3">
                            <AddressFind v-model="addressInfo" />
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

.from_wrap_mypage {
    width: auto !important;
}

.flex.password {
    width: 44.5% !important;
}
</style>
