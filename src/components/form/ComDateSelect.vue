<script setup lang="ts">
/*
 * @file     ComDateSelect.vue
 * @menu     날짜선택 공통 컴포넌트
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, computed } from 'vue';
import Datepicker from 'vue3-datepicker';
import { ko } from 'date-fns/locale';

// ==================================================
// Type 선언 영역
// ==================================================
interface Props {
    modelValue?: Date | null;
    mode?: 'search' | 'input';
    label?: string;
    required?: boolean;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    inputFormat?: string;
    clearable?: boolean;
}

// ==================================================
// 변수 선언 영역
// ==================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    mode: 'search',
    label: '',
    required: false,
    weekStartsOn: 0,
    inputFormat: 'yyyy-MM-dd',
    clearable: false,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: Date | null): void;
    (e: 'closed'): void;
}>();
const dateRef = ref<any>(null);

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

const selectedDate = computed<any>({
    get() {
        return props.modelValue;
    },
    set(val: any) {
        emit('update:modelValue', val);
    },
});

const onClosed = () => {
    const inputEl = (dateRef.value as any)?.$el?.querySelector('input');
    inputEl?.blur();
    emit('closed');
};

defineExpose({
    setFocus: () => dateRef.value?.focus(),
});

// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <!-- 조회조건 화면 -->
    <template v-if="mode === 'search'">
        <label v-if="label">{{ required ? '* ' : '' }}{{ label }}</label>

        <span class="search_cell search_cell_long">
            <div class="search_date datePickerClass">
                <Datepicker
                    ref="dateRef"
                    v-model="selectedDate"
                    :locale="ko"
                    :week-starts-on="props.weekStartsOn"
                    :input-format="props.inputFormat"
                    :clearable="props.clearable"
                    @closed="onClosed"
                />
            </div>
        </span>
    </template>

    <!-- 입력 화면 -->
    <template v-else>
        <div class="datePickerClass">
            <Datepicker
                ref="dateRef"
                v-model="selectedDate"
                :locale="ko"
                :week-starts-on="props.weekStartsOn"
                :input-format="props.inputFormat"
                :clearable="props.clearable"
                @closed="onClosed"
            />
        </div>
    </template>
</template>
