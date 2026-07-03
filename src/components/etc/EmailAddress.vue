<script setup lang="ts">
/*
 * @file     EmailAddress.vue
 * @menu     이메일 주소 입력
 * @author   astems
 * @since    2026-06-18
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ComInputbox from '@/components/form/ComInputbox.vue';

// =====================================================================================================
// Type 선언
// =====================================================================================================
interface Props {
    modelValue?: string;
}

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
});

const { t } = useI18n();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const textRef = ref<HTMLInputElement | null>(null);

const emailId = ref('');
const emailDomain = ref('');
const readOnlyFg = ref(false);

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
] as const;

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================

/**
 * 이메일 조합하여 부모로 전달
 */
const updateEmail = () => {
    const value = emailId.value && emailDomain.value ? `${emailId.value}@${emailDomain.value}` : '';

    emit('update:modelValue', value);
};

/**
 * 이메일 분리
 */
const parseEmail = (value: string) => {
    const atIndex = value.indexOf('@');

    if (atIndex < 0) {
        emailId.value = value;
        emailDomain.value = '';
        readOnlyFg.value = false;
        return;
    }

    emailId.value = value.substring(0, atIndex);
    emailDomain.value = value.substring(atIndex + 1);
    readOnlyFg.value = emailOptions.includes(emailDomain.value as (typeof emailOptions)[number]);
};

/**
 * 도메인 선택
 */
const selectEmail = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value;

    readOnlyFg.value = value !== '';
    emailDomain.value = value;

    updateEmail();
};

defineExpose({
    setFocus: () => textRef.value?.focus(),
});

// =====================================================================================================
// Hook 영역
// =====================================================================================================
watch(
    () => props.modelValue,
    (value) => {
        parseEmail(value ?? '');
    },
    {
        immediate: true,
    },
);
</script>

<template>
    <div class="email" style="width: auto">
        <div class="form_wrap">
            <span class="form_cell form_input">
                <ComInputbox
                    ref="textRef"
                    v-model="emailId"
                    class="emailId"
                    type="text"
                    :placeholder="t('user.label.emailId')"
                    @update:model-value="updateEmail"
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
                    <option value="">
                        {{ t('com.label.selfInput') }}
                    </option>

                    <option v-for="email in emailOptions" :key="email" :value="email">
                        {{ email }}
                    </option>
                </select>
            </div>
        </div>

        <div class="form_wrap ml10">
            <span class="form_cell form_input">
                <ComInputbox
                    v-model="emailDomain"
                    type="text"
                    :placeholder="t('com.label.selfInput')"
                    :readonly="readOnlyFg"
                    @update:model-value="updateEmail"
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
