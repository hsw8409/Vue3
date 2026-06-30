<script setup lang="ts">
/**
 * @file     AppPopup.vue
 * @menu     공통 팝업 컴포넌트
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { reactive, ref, onUnmounted } from 'vue';
import { usePopupStore } from '@/common/stores/popup';
import type { PopupProps } from '@/types/popup';

// ==================================================
// Type 선언 영역
// ==================================================
interface PopupPosition {
    x: number;
    y: number;
}

// ==================================================
// 변수 선언 영역
// ==================================================
const popup = usePopupStore();

const positions = reactive<Record<string, PopupPosition>>({});

const dragInfo = ref<{ id: string | null; startX: number; startY: number }>({
    id: null,
    startX: 0,
    startY: 0,
});

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
/**
 * 팝업 화면 뒤 배경 선택시 팝업 닫기
 *
 */
const handleDimClick = (item: PopupProps) => {
    if (item.type === 'biz') popup.closePopup(item.id);
};

/**
 * 팝업 타이틀 선택후 드래그 시작
 *
 */
const startDrag = (event: MouseEvent, item: PopupProps) => {
    if (!positions[item.id]) {
        positions[item.id] = { x: 0, y: 0 };
    }

    const pos = positions[item.id]!;

    dragInfo.value = {
        id: item.id,
        startX: event.clientX - pos.x,
        startY: event.clientY - pos.y,
    };

    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', stopDrag);
};

/**
 * 팝업 타이틀 선택후 드래그 이동
 *
 */
const moveDrag = (event: MouseEvent) => {
    const { id } = dragInfo.value;
    if (!id || !positions[id]) return;

    const popupElement = document.querySelector(
        `[data-popup-id="${id}"] .popup_content_container`,
    ) as HTMLElement;
    if (!popupElement) return;

    const rect = popupElement.getBoundingClientRect();
    const x = event.clientX - dragInfo.value.startX;
    const y = event.clientY - dragInfo.value.startY;

    // 화면 경계 계산
    const maxX = (window.innerWidth - rect.width) / 2;
    const maxY = (window.innerHeight - rect.height) / 2;

    positions[id].x = Math.min(Math.max(x, -maxX), maxX);
    positions[id].y = Math.min(Math.max(y, -maxY), maxY);
};

/**
 * 팝업 타이틀 선택후 드래그 종료
 *
 */
const stopDrag = () => {
    dragInfo.value.id = null;
    window.removeEventListener('mousemove', moveDrag);
    window.removeEventListener('mouseup', stopDrag);
};

/**
 * 팝업 사이즈 등
 *
 */
const getPopupStyle = (item: PopupProps) => {
    const pos = positions[item.id];
    const transform = pos ? `translate(${pos.x}px, ${pos.y}px)` : '';

    if (item.type === 'biz') {
        const width = item.props?.width || 'auto';
        const height = item.props?.height || 'auto';

        console.info('width>>>', width);
        return {
            transform,
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
        };
    }

    // 2. 그 외(message 타입)인 경우
    // message 타입은 크기를 CSS 클래스에 맡기고 위치(transform)만 반환합니다.
    return {
        transform,
    };
};

// ==================================================
// Hook 영역
// ==================================================
onUnmounted(() => {
    window.removeEventListener('mousemove', moveDrag);
    window.removeEventListener('mouseup', stopDrag);
});
</script>

<template>
    <div
        v-for="(item, index) in popup.popups"
        :key="item.id"
        class="popup_overlay"
        :data-popup-id="item.id"
        :style="{ zIndex: 1000 + index }"
    >
        <div class="popup_dim" @click="handleDimClick(item)" />
        <div class="popup_content_container" :class="[item.type]" :style="getPopupStyle(item)">
            <div
                v-if="item.type === 'biz'"
                class="popup_header"
                @mousedown="startDrag($event, item)"
            >
                <div class="popup_title">{{ item.props?.title || '' }}</div>
                <button class="popup_close_btn" @mousedown.stop @click="popup.closePopup(item.id)">
                    ✕
                </button>
            </div>
            <div class="popup_body">
                <component
                    :is="item.component"
                    v-bind="item.props"
                    @close="popup.closePopup(item.id)"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.popup_overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden; /* 외곽 브라우저 스크롤은 철저히 차단 */
    padding: 20px;
    box-sizing: border-box;
    z-index: 1000;
}

.popup_dim {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
}

/* 팝업 컨테이너 및 내부 전체에 박스 격리 적용 */
.popup_content_container {
    position: relative;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
    box-sizing: border-box;

    /* 💡 [수정] 세로 크기는 화면 안에 가두되, 가로 유연성 확보 */
    max-height: 100%;
    display: flex;
    flex-direction: column;
}

.popup_content_container * {
    box-sizing: border-box;
}

/* 팝업 애니메이션 */
.popup_overlay .popup_content_container {
    animation: popup-show 0.2s ease-out forwards;
}

@keyframes popup-show {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* header */
.popup_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
    background: #fafafa;
    cursor: move;
    flex-shrink: 0; /* 헤더 찌그러짐 방지 */
}

.popup_title {
    font-weight: bold;
    font-size: 14px;
}

.popup_close_btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
}

/* 💡 [핵심 변형] 가로/세로 스크롤바가 완벽하게 잡히는 본문 스펙 */
.popup_body {
    padding: 16px;

    flex: 1;
    min-height: 0;

    overflow-x: auto;
    overflow-y: auto;
}

/* size */
.popup_content_container.message {
    min-width: 300px;
    max-width: 400px;

    height: auto;
}

/* 비즈니스 팝업 */
.popup_content_container.biz {
    max-width: 90vw;
    max-height: 90vh;

    display: flex;
    flex-direction: column;
}
</style>
