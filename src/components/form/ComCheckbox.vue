<script setup lang="ts">
/*
 * @file     CheckBox.vue
 * @menu     체크박스 공통 컴포넌트
 * @author   astems
 * @since    2026-06-15
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, computed } from 'vue';

interface CheckBoxParams {
    label?: string;
    labelFor?: string;
    spanClass?: string;
}

interface Props {
    modelValue?: boolean;
    params?: CheckBoxParams;
}

// ==================================================
// 변수 선언 영역
// ==================================================
// 기본값 정의와 함께 props 주입
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    params: () => ({}),
});

// 이벤트 바인딩
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'change', event: Event): void; // HTML 원본 체인지 이벤트 전달 규격
}>();

// ref
const checkboxRef = ref<HTMLInputElement | null>(null);

// 부모 컴포넌트와 데이터 통신을 위해 처리
const selectedValue = computed({
    get(): boolean {
        return props.modelValue;
    },
    set(value: boolean) {
        emit('update:modelValue', value);
    },
});

// 반응형 흐름을 놓치지 않도록 computed 처리
const spanRefClass = computed(() => props.params?.spanClass || 'form_cell form_check');

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
// 체크
function onChange(event: Event): void {
    emit('change', event);
}

// focus 메서드 생성
function setFocus(): void {
    checkboxRef.value?.focus();
}

// 부모 컴포넌트가 ref를 통해 제어할 메서드 공개
defineExpose({
    setFocus,
});

// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <span :class="spanRefClass">
        <input
            :id="params.labelFor"
            ref="checkboxRef"
            v-model="selectedValue"
            type="checkbox"
            v-bind="$attrs"
            @change="onChange"
        />
        <label v-if="params.label" :for="params.labelFor">
            <span>{{ params.label }}</span>
        </label>
    </span>
</template>
