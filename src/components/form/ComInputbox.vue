<script setup lang="ts">
/**
 * @file    /components/form/ComInputbox.vue
 * @menu    입력박스 공통 컴포넌트
 * @author  astems
 * @since   2026-06-23
 * @version 1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, computed, useAttrs } from 'vue';

// =====================================================================================================
// Type 선언
// =====================================================================================================

// 컴포넌트 표준 Props 정의 (기능/표준 속성 위주)
interface Props {
    modelValue?: string;
    placeholder?: string;
    type?: 'text' | 'password' | 'number';
    id?: string;
    name?: string;
    autocomplete?: string;
    disabled?: boolean;
    readonly?: boolean;
    label?: string;
    required?: boolean;
    maxlength?: number;
}

// =====================================================================================================
// 변수 선언
// =====================================================================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    type: 'text',
    id: '',
    name: '',
    autocomplete: 'off',
    disabled: false,
    readonly: false,
    label: '',
    required: false,
    maxlength: 20,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'input', value: string): void;
    (e: 'enter'): void;
    (e: 'click', event: MouseEvent): void;
    (e: 'keydown', event: KeyboardEvent): void;
}>();

const textRef = ref<HTMLInputElement | null>(null);

const attrs = useAttrs();

const attrId = computed(() => props.id || `input_${crypto.randomUUID()}`);

const isPassword = computed(() => props.type === 'password');

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;

    emit('update:modelValue', target.value);
    emit('input', target.value);
};

const onClick = (event: MouseEvent) => {
    emit('click', event);
};

const onEnter = () => {
    emit('enter');
};

defineExpose({ setFocus: () => textRef.value?.focus() });

// =====================================================================================================
// Hook 영역
// =====================================================================================================
</script>

<template>
    <label v-if="label" :for="attrId">{{ required ? '* ' : '' }}{{ label }}</label>

    <span class="form_cell form_input">
        <div v-if="isPassword" class="password-wrapper">
            <input
                :id="attrId"
                ref="textRef"
                class="search_input"
                :type="type"
                :value="modelValue"
                :placeholder="placeholder"
                :autocomplete="autocomplete"
                :readonly="readonly"
                :disabled="disabled"
                :maxlength="maxlength"
                v-bind="attrs"
                @input="onInput"
                @click="onClick"
                @keyup.enter="onEnter"
            />
            <span class="pwd-icon">🔒</span>
        </div>

        <input
            v-else
            :id="attrId"
            ref="textRef"
            class="search_input"
            :type="type"
            :value="modelValue"
            :placeholder="placeholder"
            :autocomplete="autocomplete"
            :readonly="readonly"
            :disabled="disabled"
            :maxlength="maxlength"
            v-bind="attrs"
            @input="onInput"
            @click="onClick"
            @keyup.enter="onEnter"
        />
    </span>
</template>

<style scoped>
.password-wrapper {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
}
.pwd-icon {
    position: absolute;
    right: 10px;
}
.search_input {
    width: 100%;
    pointer-events: auto; /* readonly여도 클릭 가능하도록 강제 */
    cursor: pointer; /* 클릭 가능함을 사용자에게 알림 */
}
</style>
