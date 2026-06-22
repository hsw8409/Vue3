<script setup lang="ts">
/*
 * @file     PopupMessage.vue
 * @menu     공통 팝업 컴포넌트
 * @author   astems
 * @since    2026-06-16
 * @version  1.0
 */
import { computed } from 'vue';
import { PopupMessageProps, usePopupStore } from '@/common/stores/popup';

// 🌟 현재 팝업의 고유 ID를 부모로부터 안전하게 전달받을 수 있도록 props 구조 확장
interface ExtendedProps extends PopupMessageProps {
    id?: string;
}

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

// 🌟 팝업을 직접 제어할 스토어 인스턴스 생성
const popupStore = usePopupStore();

const hasTitle = computed(() => props.title.trim().length > 0);

const handleOkClick = (): void => {
    // 1. 등록된 콜백 함수가 있으면 먼저 실행하고
    props.onOk?.();

    // 2. 🌟 허공에 emit을 날리는 대신, 내 고유 ID를 가지고 스토어를 직접 종료시킵니다.
    if (props.id) {
        popupStore.closePopup(props.id);
    } else {
        // 혹시나 id가 안 넘어왔을 때를 대비한 하위 호환 가드
        emit('close');
    }
};

const handleCancelClick = (): void => {
    // 1. 취소 콜백 실행
    props.onCancel?.();

    // 2. 🌟 취소 버튼도 본인의 고유 ID로 스토어를 직접 깨워 확실하게 닫아줍니다.
    if (props.id) {
        popupStore.closePopup(props.id);
    } else {
        emit('close');
    }
};
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
