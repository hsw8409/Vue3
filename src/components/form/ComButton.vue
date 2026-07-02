<script setup lang="ts">
/**
 * @file     ComButton.vue
 * @menu     버튼 공통 컴포넌트
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================

// ==================================================
// Type 선언 영역
// ==================================================
interface Props {
    text?: string;
    type?: 'primary' | 'secondary' | 'default';
    disabled?: boolean;
}

// ==================================================
// 변수 선언 영역
// ==================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({
    inheritAttrs: false,
});

withDefaults(defineProps<Props>(), {
    text: '버튼',
    type: 'default',
    disabled: false,
});

const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void;
}>();

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
const onButtonClick = (event: MouseEvent) => {
    emit('click', event);
};

// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <button type="button" class="subBtn" :disabled="disabled" @click="onButtonClick">
        <span>{{ text }}</span>
    </button>
</template>

<style scoped></style>
