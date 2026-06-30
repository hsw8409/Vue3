<script setup lang="ts">
/**
 * @file    /components/form/ComInputbox.vue
 * @menu    입력박스 공통 컴포넌트
 * @author  astems
 * @since   2026-06-23
 * @version 1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, computed, useAttrs } from 'vue';

// ==================================================
// Type 선언 영역
// ==================================================

// 컴포넌트 표준 Props 정의 (기능/표준 속성 위주)
interface Props {
    modelValue?: string | number;
    placeholder?: string;
    type?: string;
    id?: string;
    name?: string;
    autocomplete?: string;
    disabled?: boolean;
    readonly?: boolean;
    label?: string;
    maxlength?: string | number;
    // 기타 필요한 속성들만 추가...
    [key: string]: any;
}

// ==================================================
// 변수 선언 영역
// ==================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({ inheritAttrs: false });

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
    maxlength: undefined,
});
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'enter'): void;
    (e: 'click', event: MouseEvent): void; // 필요한 이벤트를 명시적으로 추가하거나...
}>();

const attrs = useAttrs();
const textRef = ref<HTMLInputElement | null>(null);
// ID 자동 생성
const attrId = computed(
    () => (props.id as string) || `input_${Math.random().toString(36).substring(2, 9)}`,
);

// 타입 분기
const isPassword = computed(() => props.type === 'password');

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    emit('update:modelValue', target.value);
};
const onEnter = () => emit('enter');

defineExpose({ setFocus: () => textRef.value?.focus() });

// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <label v-if="label" :for="attrId">{{ label }}</label>
    <span class="form_cell form_input">
        <template v-if="isPassword">
            <div class="password-wrapper">
                <input
                    :id="attrId"
                    ref="textRef"
                    class="search_input"
                    type="password"
                    :value="modelValue"
                    :readonly="readonly"
                    :disabled="disabled"
                    :maxlength="maxlength"
                    v-bind="attrs"
                    @input="onInput"
                    @keyup.enter="onEnter"
                />
                <span class="pwd-icon">🔒</span>
            </div>
        </template>

        <template v-else>
            <input
                :id="attrId"
                ref="textRef"
                class="search_input"
                :type="type"
                :value="modelValue"
                :readonly="readonly"
                :disabled="disabled"
                :maxlength="maxlength"
                v-bind="attrs"
                @input="onInput"
                @keyup.enter="onEnter"
            />
        </template>
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
    cursor: pointer;
}
.search_input {
    width: 100%;
    pointer-events: auto; /* readonly여도 클릭 가능하도록 강제 */
    cursor: pointer; /* 클릭 가능함을 사용자에게 알림 */
}
</style>
