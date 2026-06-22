<script setup lang="ts">
/*
 * @file     Button.vue
 * @menu     버튼 컴포넌트
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, computed } from 'vue';

// ==================================================
// Type 선언 영역
// ==================================================
interface ButtonParams {
    name: string; // 버튼 텍스트
    buttonClass?: string; // 버튼 스타일 클래스 (선택 사항)
}

// ==================================================
// 변수 선언 영역
// ==================================================
// props 정의 및 타입 매핑
const props = defineProps<{
    params: ButtonParams;
}>();

// 이벤트 바인딩 정의
const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void;
}>();

// 엘리먼트 참조를 위한 ref
const buttonRef = ref<HTMLButtonElement | null>(null);

// 상위 params가 변경되어도 클래스가 동적으로 반응하도록 computed 처리 🌟
const buttonRefClass = computed(() => props.params?.buttonClass || 'subBtn');

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
// 버튼 클릭 이벤트 핸들러
const onButtonClick = (event: MouseEvent) => {
    emit('click', event); // 이벤트 객체를 함께 넘겨주면 활용도가 높아집니다.
};

// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <button
        ref="buttonRef"
        type="button"
        :class="buttonRefClass"
        v-bind="$attrs"
        @click="onButtonClick"
    >
        <span>{{ params.name }}</span>
    </button>
</template>

<style scoped>
.m15 {
    margin-left: 5px !important;
}
</style>
