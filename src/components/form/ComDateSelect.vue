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
import { ref, computed, useAttrs } from 'vue';
import Datepicker from 'vue3-datepicker';
import { ko } from 'date-fns/locale';

// ==================================================
// 변수 선언 영역
// ==================================================
interface Props {
    modelValue?: Date | null;
    mode?: 'search' | 'input';
    label?: string;
    required?: boolean;
    [key: string]: any;
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    mode: 'search',
    label: '',
    required: false,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: Date | null): void;
    (e: 'closed'): void;
}>();
const dateRef = ref<any>(null);
const attrs = useAttrs();

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

const selectedDate = computed<any>({
    get() {
        return props.modelValue;
    },
    set(val: any) {
        console.log('자식 컴포넌트에서 감지된 값:', val);
        emit('update:modelValue', val);
    },
});

const onClosed = () => {
    // dateRef가 올바르게 참조되는지 확인 후 blur 처리
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
                    v-bind="attrs"
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
                v-bind="attrs"
                @closed="onClosed"
            />
        </div>
    </template>
</template>
