<script setup lang="ts">
/*
 * @file     DatePeriod.vue
 * @menu     날짜 기간 선택
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref } from 'vue';
import Datepicker from 'vue3-datepicker';
import { ko } from 'date-fns/locale';

// ==================================================
// Type 선언 영역
// ==================================================
interface Props {
    modelValue: Record<string, any>;
    params?: Record<string, any>;
    startDtKey?: string;
    endDtKey?: string;
}

// ==================================================
// 변수 선언 영역
// ==================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
    startDtKey: 'startDate',
    endDtKey: 'endDate',
    params: () => ({}),
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, unknown>): void;
    (e: 'closed'): void;
}>();
const startDateRef = ref<any>(null);

// =================================================================
// 사용자 정의 함수 영역
// =================================================================
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

// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <label v-if="params.label" :class="params.labelClass">
        {{ params.required ? '* ' : '' }} {{ params.label }}
    </label>

    <span class="rangeDate_wrap">
        <span class="search_date datePickerClass'">
            <Datepicker
                ref="startDateRef"
                :model-value="modelValue[startDtKey]"
                :locale="ko"
                @update:model-value="(val: Date | null | undefined) => updateDate(startDtKey, val)"
                @closed="onClosed"
            />
        </span>
        <div class="dateBetween">~</div>
        <span class="search_date datePickerClass'">
            <Datepicker
                :model-value="modelValue[endDtKey]"
                :locale="ko"
                @update:model-value="(val: Date | null | undefined) => updateDate(endDtKey, val)"
                @closed="onClosed"
            />
        </span>
    </span>
</template>
