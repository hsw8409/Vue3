<script setup lang="ts">
/*
 * @file     AppPopup.vue
 * @menu     공통 팝업 컴포넌트
 * @author   astems
 * @since    2026-06-16
 * @version  1.0
 */
import { reactive, ref } from 'vue';
import { usePopupStore, PopupProps } from '@/common/stores/popup';

const popup = usePopupStore();

interface PopupPosition {
    x: number;
    y: number;
}

/**
 * 팝업별 이동 위치
 */
const positions = reactive<Record<string, PopupPosition>>({});

/**
 * 드래그 정보
 */
const dragInfo = ref<{
    id: string | null;
    startX: number;
    startY: number;
}>({
    id: null,
    startX: 0,
    startY: 0,
});

/**
 * 메시지 팝업 dim 처리
 */
const handleDimClick = (item: PopupProps) => {
    if (item.type === 'message') {
        popup.closePopup(item.id);
    }
};

/**
 * 드래그 시작
 */
const startDrag = (event: MouseEvent, item: PopupProps) => {
    if (!positions[item.id]) {
        positions[item.id] = {
            x: 0,
            y: 0,
        };
    }

    const position = positions[item.id];

    if (!position) return;

    dragInfo.value = {
        id: item.id,
        startX: event.clientX - position.x,
        startY: event.clientY - position.y,
    };

    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', stopDrag);
};

/**
 * 드래그 이동
 */
const moveDrag = (event: MouseEvent) => {
    const id = dragInfo.value.id;
    if (!id) return;

    const position = positions[id];
    if (!position) return;

    const popupElement = document.querySelector(
        `[data-popup-id="${id}"] .popup_content_container`,
    ) as HTMLElement;

    if (!popupElement) return;

    const popupWidth = popupElement.offsetWidth;
    const popupHeight = popupElement.offsetHeight;

    const x = event.clientX - dragInfo.value.startX;
    const y = event.clientY - dragInfo.value.startY;

    const minX = -(window.innerWidth / 2) + popupWidth / 2;
    const maxX = window.innerWidth / 2 - popupWidth / 2;
    const minY = -(window.innerHeight / 2) + popupHeight / 2;
    const maxY = window.innerHeight / 2 - popupHeight / 2;

    position.x = Math.min(Math.max(x, minX), maxX);
    position.y = Math.min(Math.max(y, minY), maxY);
};

/**
 * 드래그 종료
 */
const stopDrag = () => {
    dragInfo.value.id = null;
    document.removeEventListener('mousemove', moveDrag);
    document.removeEventListener('mouseup', stopDrag);
};

/**
 * 팝업 위치 스타일
 */
const getPopupStyle = (item: PopupProps) => {
    const position = positions[item.id];
    if (!position) {
        return {};
    }
    return {
        transform: `translate(${position.x}px, ${position.y}px)`,
    };
};
</script>

<template>
    <div
        v-for="(item, index) in popup.popups"
        :key="item.id"
        class="popup_overlay"
        :data-popup-id="item.id"
        :style="{
            zIndex: 1000 + index,
        }"
    >
        <div class="popup_dim" @click="handleDimClick(item)" />

        <div class="popup_content_container" :class="[item.type]" :style="getPopupStyle(item)">
            <div
                v-if="item.type === 'biz'"
                class="popup_header"
                @mousedown="startDrag($event, item)"
            >
                <div class="popup_title">
                    {{ item.props?.title ? item.props.title : '' }}
                </div>

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

    /* 💡 두 축 모두 스크롤바를 자동 생성하도록 강제 */
    overflow-x: auto !important;
    overflow-y: auto !important;

    width: 100%;
    height: auto;
}

/* size */
.popup_content_container.message {
    min-width: 300px;
    max-width: 400px;
}

/* 비즈니스 팝업 (마이페이지 등) */
.popup_content_container.biz {
    width: 800px;

    /* 💡 [수정] 고정 height를 auto로 바꾸어 콘텐츠 양에 따라 팝업창이 핏하게 줄어들게 만듭니다. */
    height: auto;

    /* 💡 단, 늘어날 수 있는 마지노선은 화면의 90%로 제한 (넘치면 내부 스크롤 가동) */
    max-height: 90vh;

    /* 테이블 가로 깨짐 방지 최소 너비 */
    min-width: 760px;
    max-width: 100% !important;
    display: flex;
    flex-direction: column;
}
</style>
