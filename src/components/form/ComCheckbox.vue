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

// ==================================================
// Type 선언 영역
// ==================================================
interface Props {
    modelValue?: boolean;
    id?: string;
    label?: string;
    disabled?: boolean;
}

// ==================================================
// 변수 선언 영역
// ==================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    id: '',
    label: '',
    disabled: false,
});
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'change', event: Event): void;
}>();

const checkboxRef = ref<HTMLInputElement | null>(null);

const attrs = useAttrs();

const attrId = computed(() => props.id || `checkbox_${crypto.randomUUID()}`);

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
    <span class="form_cell form_check">
        <input
            :id="attrId"
            ref="checkboxRef"
            type="checkbox"
            :checked="modelValue"
            :disabled="disabled"
            v-bind="attrs"
            @change="handleChange"
        />

        <label v-if="label" :for="attrId">
            {{ label }}
        </label>
    </span>
</template>
