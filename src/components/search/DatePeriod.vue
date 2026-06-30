<script setup lang="ts">
/*
 * @file    DatePeriod.vue
 * @menu    날짜 기간 선택
 * @author  astems
 * @since   2026-06-26
 * @version 1.1
 */

import { ref } from 'vue';
import Datepicker from 'vue3-datepicker';
import { ko } from 'date-fns/locale';

// --- 인터페이스 정의 ---
interface Props {
    modelValue: Record<string, any>;
    params?: Record<string, any>;
    startDtKey?: string;
    endDtKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
    startDtKey: 'startDate',
    endDtKey: 'endDate',
    params: () => ({}),
});

const emit = defineEmits(['update:modelValue', 'closed']);
const startDateRef = ref<any>(null);

// --- 반응형 데이터 처리 ---
// 객체의 특정 키를 업데이트하기 위해 emit을 사용한 setter 처리
const updateDate = (key: string, value: Date | null | undefined) => {
    emit('update:modelValue', {
        ...props.modelValue,
        [key]: value,
    });
};

const onClosed = () => {
    startDateRef.value?.$el?.querySelector('input')?.blur();
    emit('closed');
};

const setFocus = () => {
    startDateRef.value?.focus();
};

defineExpose({ setFocus });
</script>

<template>
    <label v-if="params.label" :class="params.labelClass">
        {{ params.required ? '* ' : '' }} {{ params.label }}
    </label>

    <span class="rangeDate_wrap">
        <span :class="params.spanClass || 'search_date datePickerClass'">
            <Datepicker
                ref="startDateRef"
                :model-value="modelValue[startDtKey]"
                :locale="ko"
                v-bind="$attrs"
                @update:model-value="(val: Date | null | undefined) => updateDate(startDtKey, val)"
                @closed="onClosed"
            />
        </span>
        <div class="dateBetween">~</div>
        <span :class="params.spanClass || 'search_date datePickerClass'">
            <Datepicker
                :model-value="modelValue[endDtKey]"
                :locale="ko"
                v-bind="$attrs"
                @update:model-value="(val: Date | null | undefined) => updateDate(endDtKey, val)"
                @closed="onClosed"
            />
        </span>
    </span>
</template>
