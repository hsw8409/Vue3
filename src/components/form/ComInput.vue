<script setup lang="ts">
/*
 * @file     TextBox.vue
 * @menu     입력박스 공통 컴포넌트
 * @author   astems
 * @since    2026-06-15
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, computed } from 'vue';

// ==================================================
// Type 선언 영역
// ==================================================
interface TextBoxParams {
    label?: string;
    spanClass?: string;
    spanStyle?: string;
    inputClass?: string;
}

// 부모에게 전달받을 속성의 타입을 명확히 지정 (Generic 컴파일 방식)
interface Props {
    modelValue?: string;
    params?: TextBoxParams;
}

// ==================================================
// 변수 선언 영역
// ==================================================
const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    params: () => ({}),
});

// ref
const textRef = ref<HTMLInputElement | null>(null);

// 이벤트 바인딩
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'enter'): void;
}>();

const spanRefClass = computed(() => props.params?.spanClass || 'form_cell form_input');
const spanRefStyle = computed(() => props.params?.spanStyle || '');
const textRefClass = computed(() => props.params?.inputClass || 'search_input');

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
// 입력
const onInput = (event: Event) => {
    // 이벤트 타겟을 HTMLInputElement로 단언하여 any 우회 및 안전성 확보
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
};

// key up
const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        emit('enter');
    }
};

// focus 메서드 생성
function setFocus(): void {
    textRef.value?.focus();
}

// 부모가 사용할 수 있도록 노출
defineExpose({
    setFocus,
});
// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <span :class="spanRefClass" :style="spanRefStyle">
        <input
            ref="textRef"
            type="text"
            :class="textRefClass"
            :value="modelValue"
            v-bind="$attrs"
            @input="onInput"
            @keyup="onKeyUp"
        />
    </span>
</template>

<style scoped>
.auto {
    width: 100% !important;
}
</style>
