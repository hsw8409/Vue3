<script setup lang="ts">
/*
 * @file     MainTab.vue
 * @menu     메뉴 탭 제어 컴포넌트
 * @author   astems
 * @since    2026-06-25
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import {
    computed,
    defineAsyncComponent,
    ref,
    inject,
    onUpdated,
    onBeforeUpdate,
    watch,
    provide,
    type Component,
    type Ref,
} from 'vue';
import { storeToRefs } from 'pinia';
import HomeView from '@/components/main/layout/HomeView.vue';
import { usePopupStore } from '@/common/stores/popup';
import { useMenuStore } from '@/common/stores/menu';
import { useTabStore } from '@/common/stores/tab';
import { utils } from '@/common/utils';

import type { SelectedMenuProps } from '@/types/menu';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================

interface SelectedPageProps extends SelectedMenuProps {
    params?: Record<string, unknown>;
}

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================

const popupStore = usePopupStore();
const menuStore = useMenuStore();
const tabStore = useTabStore();

const hideToggle = inject<Ref<boolean>>('hideToggle', ref(false));

const emit = defineEmits<{
    (e: 'menuSet', menu: any): void;
}>();

provide(
    'currentMenu',
    computed(() => currentMenu.value),
);
provide('addTab', (i: any) => addTab(i));

// Vite 동적 모듈 로더 파일 스캔
const modules = import.meta.glob('/src/views/**/*.vue');

const tabList = ref<HTMLElement[]>([]);
onBeforeUpdate(() => {
    tabList.value = [];
});

const draggingIndex = ref(-1);
const nowWidth = ref(0);
const calcSize = ref(270);

const { tabs, activeIndex } = storeToRefs(tabStore);

const currentIndex = computed({
    get() {
        return activeIndex.value;
    },

    set(value: number) {
        tabStore.setActive(value);
    },
});

const currentTabComponent = computed<Component>(() => {
    const component = tabStore.activeTab?.component;

    return component ?? HomeView;
});

const currentTabKey = computed<string | number>(() => {
    return tabStore.activeTab?.key ?? 'home-view';
});

const currentMenu = computed(() => {
    return tabStore.activeTab;
});

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const scrollToTab = (index: number) => {
    if (tabs.value.length === 0 || !tabList.value[index]) {
        return;
    }

    tabList.value[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
    });

    emit('menuSet', currentMenu.value);
};

const addTab = async (i: SelectedPageProps) => {
    const selectedMenu = menuStore.getSelectedMenu(i.mcd);

    if (!selectedMenu) {
        return false;
    }

    try {
        if (!selectedMenu.path) {
            popupStore.alert('화면 경로가 존재하지 않습니다.');

            return false;
        }

        if (utils.obj.isBlank(modules[selectedMenu.path])) {
            popupStore.alert(`화면[ ${selectedMenu.sname} ]이 존재하지 않습니다.`);

            return false;
        }

        const loader = modules[selectedMenu.path] as () => Promise<Component>;

        const component = defineAsyncComponent(loader);

        tabStore.openTab({
            mcd: selectedMenu.mcd,
            sname: selectedMenu.sname,
            lname: selectedMenu.lname,
            mname: selectedMenu.mname,
            path: selectedMenu.path,
            fileNm: selectedMenu.fileNm,
            component,
            params: i.params ?? {},
        });

        return true;
    } catch (error: any) {
        popupStore.alert(`${error?.message || error}\n새로고침 후 이용해주세요.`);

        return false;
    }
};

const layoutSizeChanged = (e: boolean) => {
    if (!currentMenu.value) {
        return;
    }

    const elements = document.querySelectorAll(
        '[id^="aui-grid-wrap-"]:not([id="aui-grid-wrap-0"])',
    );

    const array = Array.from(elements).map((v: any) => ({
        id: v.id,
        width: v.clientWidth,
    }));

    const contWrapWidth = document.getElementsByClassName('cont_wrap').item(0)?.clientWidth || 0;

    nowWidth.value = contWrapWidth;

    const gridParent = array.map(({ id, width }) => {
        const ratio = width / contWrapWidth;

        return {
            id,

            widthP: width + ratio * calcSize.value,

            widthM: width - ratio * calcSize.value,
        };
    });

    gridParent.forEach(({ id, widthP, widthM }) => {
        const targetWidth = e ? widthM : widthP;

        window.AUIGrid?.resize(`#${id}`, targetWidth);
    });
};

const removeTab = (index: number) => {
    tabStore.closeTab(index);

    emit('menuSet', currentMenu.value);
};

const closeAllTabs = () => {
    tabStore.closeAll();

    emit('menuSet', undefined);
};

const tabLeft = () => {
    tabStore.moveLeft();
};

const tabRight = () => {
    tabStore.moveRight();
};

const handleDragStart = (index: number) => {
    draggingIndex.value = index;
};

const handleDragOver = (index: number) => {
    if (draggingIndex.value === -1 || draggingIndex.value === index) {
        return;
    }

    tabStore.moveTab(
        draggingIndex.value,

        index,
    );

    draggingIndex.value = index;
};

const handleDragEnd = () => {
    draggingIndex.value = -1;

    emit('menuSet', currentMenu.value);
};

const homeView = () => {
    tabStore.home();

    emit('menuSet', undefined);
};

defineExpose({
    addTab,
    layoutSizeChanged,
});

// =====================================================================================================
// Hook 영역
// =====================================================================================================
onUpdated(() => {
    const elements = document.querySelectorAll(
        '[id^="aui-grid-wrap-"]:not([id="aui-grid-wrap-0"])',
    );

    const contEl = document.getElementsByClassName('cont_wrap');

    if (elements.length > 0 && contEl.length !== 0) {
        if (!currentMenu.value) {
            return;
        }

        const array = Array.from(elements).map((v: any) => ({
            id: v.id,

            width: v.clientWidth,
        }));

        const contWrapWidth = contEl.item(0)?.clientWidth || 0;

        const gridParent = array.map(({ id, width }) => {
            const ratio = width / contWrapWidth;

            const hasGridChanged =
                nowWidth.value === contWrapWidth ||
                (nowWidth.value >= contWrapWidth + 20 && nowWidth.value <= contWrapWidth + 30);

            return {
                id,

                widthP: hasGridChanged ? width + ratio * calcSize.value : width,

                widthM: hasGridChanged ? width - ratio * calcSize.value : width,
            };
        });

        const isHide = hideToggle?.value ?? false;

        gridParent.forEach(({ id, widthP, widthM }) => {
            window.AUIGrid?.resize(`#${id}`, isHide ? widthM : widthP);
        });
    }
});

watch(currentIndex, (newIndex) => {
    if (newIndex >= 0) {
        scrollToTab(newIndex);
    }
});

watch(hideToggle, (value) => {
    layoutSizeChanged(!!value);
});
</script>

<template>
    <div id="MenuTab" class="no-print">
        <div class="tabHome">
            <button type="button" @click="homeView">
                <span>HOME</span>
            </button>
        </div>
        <div class="tabWrapper">
            <transition-group name="fade" tag="ul" class="tabList">
                <li
                    v-for="(tab, index) in tabs"
                    :key="tab.mcd"
                    :ref="
                        (el) => {
                            if (el) tabList[index] = el as HTMLElement;
                        }
                    "
                    :class="[currentIndex === index ? 'on' : 'off']"
                    draggable="true"
                    @dragstart="handleDragStart(index)"
                    @dragover.prevent="handleDragOver(index)"
                    @dragend.prevent="handleDragEnd"
                    @click.stop.prevent="currentIndex = index"
                >
                    <span>{{ tab.sname }}</span>
                    <button type="button" class="tabClose" @click.stop.prevent="removeTab(index)">
                        <span class="a11y">탭 닫기</span>
                    </button>
                </li>
            </transition-group>
        </div>
        <div class="tabBtn no-print">
            <button
                type="button"
                class="tabLeft"
                title="왼쪽 탭으로 이동"
                @click.stop.prevent="tabLeft"
            >
                <span>LEFT</span>
            </button>
            <button
                type="button"
                class="tabRight"
                title="오른쪽 탭으로 이동"
                @click.stop.prevent="tabRight"
            >
                <span>RIGHT</span>
            </button>
            <button
                type="button"
                class="allClose"
                title="현재 탭 닫기"
                @click.stop.prevent="removeTab(tabStore.activeIndex)"
            >
                <span>CLOSE</span>
            </button>
            <button
                type="button"
                class="allClose2"
                title="모든 탭 닫기"
                @click.stop.prevent="closeAllTabs"
            >
                <span>CLOSE ALL</span>
            </button>
        </div>
    </div>

    <Suspense>
        <template #default>
            <div id="container">
                <KeepAlive>
                    <component
                        :is="currentTabComponent"
                        :key="currentTabKey"
                        :menu-info="currentMenu"
                        :params="tabStore.activeTab?.params || {}"
                    />
                </KeepAlive>
            </div>
        </template>
        <template #fallback>
            <div>Loading</div>
        </template>
    </Suspense>
</template>

<style scoped>
.context-menu {
    list-style: none;
    position: absolute;
    border-radius: 5px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}
.aui-grid-context-item:hover {
    color: green;
    background-color: #f5f5f5;
}
.disabled-context:hover {
    color: black;
}
.disabled-context {
    background-color: white;
}
.tab-refreshing {
    animation: fade-in-animation 0.3s;
}
@keyframes fade-in-animation {
    from {
        opacity: 0.2;
    }
    to {
        opacity: 1;
    }
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
.title-wrapper {
    position: relative;
    margin-bottom: 10px;
}
.toggle-title-btn {
    position: absolute;
    left: -10px;
    top: -16px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 21px 3px 6px 3px;
    font-size: 14px;
    cursor: pointer;
    z-index: 1000;
}
.slide-enter-active,
.slide-leave-active {
    transition:
        max-height 0.3s ease,
        opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
    max-height: 100px;
    opacity: 1;
}
.modal-container,
.msg-background {
    z-index: 2000;
}
.toggle-title-btn {
    z-index: 900;
}
</style>
