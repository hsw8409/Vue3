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
import { ref, computed, useAttrs } from 'vue';

interface Props {
    modelValue?: string;
    id?: string;
    value?: any; // 체크박스 자체의 value 속성
    label?: string;
}

// ==================================================
// 변수 선언 영역
// ==================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    id: '',
    value: undefined,
    label: '',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void;
    (e: 'change', event: Event): void;
}>();
// ref
const checkboxRef = ref<HTMLInputElement | null>(null);

const attrs = useAttrs();
// ID 자동 생성
const attrId = computed(
    () => (props.id as string) || `checkbox_${Math.random().toString(36).substring(2, 9)}`,
);

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.checked);
    emit('change', event);
};

defineExpose({
    setFocus: () => checkboxRef.value?.focus(),
});

// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <span class="form_cell form_check'">
        <input
            :id="attrId"
            ref="checkboxRef"
            :value="modelValue"
            type="checkbox"
            v-bind="attrs"
            @change="handleChange"
        />
        <label v-if="label" :for="attrId">{{ label }}</label>
    </span>
</template>
