<script setup lang="ts">
/**
 * @file     /components/form/ComButton.vue
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
interface ButtonParams {
    name: string; // 버튼 텍스트
}

// ==================================================
// 변수 선언 영역
// ==================================================
// props 정의 및 타입 매핑
withDefaults(
    defineProps<{
        params?: ButtonParams;
    }>(),
    // 2. params가 없을 때의 기본값 처리
    {
        params: () => ({ name: '버튼' }),
    },
);

// 이벤트 바인딩 정의
const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void;
}>();

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
// 버튼 클릭 이벤트 핸들러
const onButtonClick = (event: MouseEvent) => {
    emit('click', event);
};

// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <button type="button" class="subBtn" v-bind="$attrs" @click="onButtonClick">
        <span>{{ params.name }}</span>
    </button>
</template>

<style scoped>
.m15 {
    margin-left: 5px !important;
}
</style>
