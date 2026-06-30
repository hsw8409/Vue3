<script setup lang="ts">
/**
 * @file     PopupMessage.vue
 * @menu     공통 팝업 컴포넌트
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { computed } from 'vue';
import { usePopupStore } from '@/common/stores/popup';

// ==================================================
// Type 선언 영역
// ==================================================
import type { PopupMessageProps } from '@/types/popup';

// 🌟 현재 팝업의 고유 ID를 부모로부터 안전하게 전달받을 수 있도록 props 구조 확장
interface ExtendedProps extends PopupMessageProps {
    id?: string;
}

// ==================================================
// 변수 선언 영역
// ==================================================
const props = withDefaults(defineProps<ExtendedProps>(), {
    id: '',
    title: '',
    buttonType: 'alert',
    okText: '확인',
    cancelText: '취소',
    onOk: undefined,
    onCancel: undefined,
});

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const popup = usePopupStore();

const hasTitle = computed(() => props.title.trim().length > 0);

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
/**
 * ok 버튼 클릭
 *
 */
const handleOkClick = (): void => {
    props.onOk?.();

    if (props.id) {
        popup.closePopup(props.id);
    } else {
        emit('close');
    }
};

/**
 * cancel 버튼 클릭
 *
 */
const handleCancelClick = (): void => {
    props.onCancel?.();

    if (props.id) {
        popup.closePopup(props.id);
    } else {
        emit('close');
    }
};
// ==================================================
// Hook 영역
// ==================================================
</script>

<template>
    <div class="msg_popup_box">
        <h3 v-if="hasTitle" class="msg_title">
            {{ title }}
        </h3>

        <p class="msg_text" :class="{ 'no-title': !hasTitle }">
            {{ message }}
        </p>

        <div class="msg_btn_wrap">
            <!-- Alert -->
            <template v-if="buttonType === 'alert'">
                <button type="button" class="btn_primary" @click="handleOkClick">
                    {{ okText }}
                </button>
            </template>

            <!-- Confirm -->
            <template v-if="buttonType === 'confirm'">
                <button type="button" class="btn_secondary" @click="handleCancelClick">
                    {{ cancelText }}
                </button>

                <button type="button" class="btn_primary" @click="handleOkClick">
                    {{ okText }}
                </button>
            </template>
        </div>
    </div>
</template>

<style scoped>
.msg_popup_box {
    padding: 24px;
    text-align: center;
    min-width: 320px;
    max-width: 420px;
    background: #ffffff;
}

.msg_title {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
}

.msg_text {
    font-size: 15px;
    line-height: 1.5;
    color: #4b5563;
    margin: 0 0 24px 0;
    /* 💡 \n 문자열이 들어왔을 때 브라우저에서 정상적으로 줄바꿈이 개행되도록 처리 */
    white-space: pre-line;
    word-break: break-all;
}

/* 제목이 없을 때는 텍스트를 살짝 더 부각시키고 위아래 여백을 밸런스 있게 조절 */
.msg_text.no-title {
    padding: 12px 0;
    font-size: 16px;
    color: #1f2937;
}

.msg_btn_wrap {
    display: flex;
    justify-content: center;
    gap: 8px;
}

/* 시각적 계층 구조(Visual Hierarchy)를 고려한 버튼 스타일 구현 */
.btn_primary {
    background: #4f46e5;
    color: #ffffff;
    border: none;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;
}
.btn_primary:hover {
    background: #4338ca;
}

.btn_secondary {
    background: #ffffff;
    color: #374151;
    border: 1px solid #d1d5db;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition:
        background 0.2s ease,
        border-color 0.2s ease;
}
.btn_secondary:hover {
    background: #f9fafb;
    border-color: #c5cdd6;
}
</style>
