<script setup lang="ts">
/*
 * @file     EmailAddress.vue
 * @menu     이메일 주소 입력
 * @author   astems
 * @since    2026-06-18
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// ==================================================
// Props & Emits 정의 (TypeScript 엄격 버전 적용)
// ==================================================
interface Props {
    modelValue?: string;
    params?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    params: () => ({}),
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const { t } = useI18n();

// ==================================================
// 반응형 상태 및 DOM Ref 변수 선언
// ==================================================
const emailId = ref('');
const emailDomain = ref('');
const readOnlyFg = ref(false);
const textRef = ref<HTMLInputElement | null>(null); // 명확한 DOM 타입 지정

const emailOptions = [
    'gmail.com',
    'naver.com',
    'daum.net',
    'hanmail.net',
    'nate.com',
    'korea.com',
    'chol.com',
    'dreamwiz.com',
    'empal.com',
    'hotmail.co.kr',
];

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
const selectEmail = (event: Event) => {
    // TypeScript 환경에서는 EventTarget을 HTMLSelectElement로 형변환해주어야 value를 인식합니다.
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    if (value === '') {
        emailDomain.value = '';
        readOnlyFg.value = false;
    } else {
        emailDomain.value = value;
        readOnlyFg.value = true;
    }
};

const setFocus = () => {
    textRef.value?.focus();
};

defineExpose({
    setFocus,
});

// ==================================================
// Hook / Watch 영역
// ==================================================

// 1. 부모에서 들어오는 값을 분리하여 내부 상태에 반영
watch(
    () => props.modelValue,
    (newVal) => {
        if (!newVal) {
            emailId.value = '';
            emailDomain.value = '';
            readOnlyFg.value = false;
            return;
        }

        const [id, domain] = newVal.split('@');
        const nextId = id ?? '';
        const nextDomain = domain ?? '';

        // 무한 루프 가드 처리 (기존 값과 다를 때만 업데이트)
        if (emailId.value !== nextId) emailId.value = nextId;
        if (emailDomain.value !== nextDomain) emailDomain.value = nextDomain;

        readOnlyFg.value = emailOptions.includes(nextDomain);
    },
    { immediate: true },
);

// 2. 내부 값이 변경될 때만 조합하여 부모로 전달 (무한 루프 방지 처리)
watch([emailId, emailDomain], () => {
    const combined = `${emailId.value}@${emailDomain.value}`;
    if (props.modelValue !== combined) {
        emit('update:modelValue', combined);
    }
});
</script>

<template>
    <div class="email" style="width: auto">
        <div class="form_wrap">
            <span class="form_cell form_input">
                <ComInput
                    ref="textRef"
                    v-model="emailId"
                    type="text"
                    class="emailId"
                    :placeholder="t('user.label.emailId')"
                />
            </span>
        </div>
        <div class="emailMark">@</div>
        <div class="form_wrap">
            <div class="form_cell form_input">
                <select
                    class="select_w100"
                    :value="readOnlyFg ? emailDomain : ''"
                    @change="selectEmail"
                >
                    <option value="">{{ t('com.label.selfInput') }}</option>
                    <option v-for="email in emailOptions" :key="email" :value="email">
                        {{ email }}
                    </option>
                </select>
            </div>
        </div>
        <div class="form_wrap ml10">
            <span class="form_cell form_input">
                <ComInput
                    v-model="emailDomain"
                    type="text"
                    :placeholder="t('com.label.selfInput')"
                    :readonly="readOnlyFg"
                />
            </span>
        </div>
    </div>
</template>

<style scoped>
.emailId {
    width: 178px !important;
}
</style>
