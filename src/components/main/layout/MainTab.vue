<script setup lang="ts">
/*
 * @file     MenuTab.vue
 * @menu     메뉴 탭 제어 컴포넌트
 * @author   astems
 * @since    2026-06-17
 * @version  1.2 (ComputedRef 언래핑 버그 수정 및 컨텍스트 메뉴 바인딩)
 */

import {
    computed,
    defineAsyncComponent,
    ref,
    inject,
    nextTick,
    onUpdated,
    onBeforeUnmount,
    onBeforeUpdate,
    watch,
    provide,
    shallowRef,
    type Component,
    type Ref,
    type ComputedRef,
} from 'vue';
import HomeView from '@/components/main/layout/HomeView.vue';
import { usePopupStore } from '@/common/stores/popup';
import { utils } from '@/common/utils';

// 탭 하나에 들어갈 데이터 구조 타입 선언
interface TabItem {
    component: Component;
    menuSclsCd: string;
    sname: string;
    key: number;
    refreshing: boolean;
    params: Record<string, any>;
}

// ==================================================
// 부모 컴포넌트로부터 주입(Inject) 및 상위 전송(Emits) 정의
// ==================================================
const hideToggle = inject<Ref<boolean>>('hideToggle');
// 💡 부모 컴포넌트의 computed 주입 방식에 맞추어 ComputedRef 래핑 타입 지정
const menuList = inject<ComputedRef<any[]>>('menuList');

const emit = defineEmits<{
    (e: 'menuSet', menu: any): void;
    (e: 'favoriteToggleEmit', val: boolean): void;
}>();

const popup = usePopupStore();

// Vite 동적 모듈 로더 파일 스캔
const modules = import.meta.glob('/src/views/**/*.vue');

// ==================================================
// DOM & 컴포넌트 인스턴스 참조 레퍼런스 (Refs)
// ==================================================
const tabList = ref<HTMLElement[]>([]);
onBeforeUpdate(() => {
    tabList.value = []; // 업데이트 직전 배열을 비워 순서 유실 방지
});

// ==================================================
// 반응형 상태 변수 선언
// ==================================================
const tabs = shallowRef<TabItem[]>([]);
const menuName = ref<any[]>([]);
const currentIndex = ref(-1);
const userId = ref('');
const draggingIndex = ref(-1);
const nowWidth = ref(0);
const params = ref<Record<string, any>>({});
const calcSize = ref(270);

const isContextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextIndex = ref(-1);

// ==================================================
// 연산된 프로퍼티 (Computed)
// ==================================================
const currentTabComponent = computed<Component>(() => {
    return tabs.value[currentIndex.value]?.component || HomeView;
});

const currentTabKey = computed<string | number>(() => {
    return tabs.value[currentIndex.value]?.key || 'home-view';
});

const currentMenu = computed(() => {
    return menuName.value[currentIndex.value];
});

// ==================================================
// 자식 컴포넌트 방향 데이터 공유 (Provide)
// ==================================================
provide(
    'userIdContext',
    computed(() => userId.value),
);
provide(
    'currentMenu',
    computed(() => currentMenu.value),
);
provide('addTab', (i: any) => addTab(i));
provide(
    'params',
    computed(() => params.value),
);

// ==================================================
// 비즈니스 로직 및 이벤트 메서드 (Methods)
// ==================================================
const scrollToTab = (index: number) => {
    if (
        tabs.value.length === 0 ||
        currentIndex.value === tabs.value.length ||
        !tabList.value ||
        !tabList.value[index]
    ) {
        return;
    }

    const element = tabList.value[index];
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }

    emit('menuSet', currentMenu.value);
};

const contextMenuControl = (flag: boolean) => {
    if (flag) {
        document.addEventListener('click', hideContextMenu);
        document.addEventListener('keydown', handleKeyEvents);
    } else {
        document.removeEventListener('click', hideContextMenu);
        document.removeEventListener('keydown', handleKeyEvents);
    }
};

const showContextMenu = (event: MouseEvent, tab: any, index: number) => {
    contextMenuX.value = event.clientX;
    contextMenuY.value = (event as any).layerY || event.clientY;
    contextIndex.value = index;
    isContextMenuVisible.value = true;
    contextMenuControl(true);
};

const hideContextMenu = () => {
    isContextMenuVisible.value = false;
    contextMenuControl(false);
};

const handleKeyEvents = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
        hideContextMenu();
    }
};

// 탭 추가 함수
const addTab = async (i: any) => {
    // 💡 부모 computed 껍데기를 해제하여 실제 내장 배열을 할당 받습니다.
    const originList = menuList?.value || [];
    if (!originList || originList.length === 0) return false;

    // 💡 menuList 대신 해제된 원본 list 배열을 타겟으로 순회합니다.
    const findItem = originList.find((menu) => menu.mcd == i.menuSclsCd && menu.lv === 3);
    if (!findItem) return false;

    const findmItem = originList.find((menu) => menu.mcd === findItem.pcd && menu.lv === 2);
    const findlItem = originList.find((menu) => menu.mcd === findmItem.pcd && menu.lv === 1);
    const selectedMenu = {
        lname: findlItem.mnm,
        mname: findmItem.mnm,
        sname: findItem.mnm,
        path: findItem.mpath,
        menuSclsCd: findItem.mcd,
        fileNm: findItem.fileNm,
        progCd: findItem.progCd,
    };

    try {
        if (utils.obj.isBlank(modules[selectedMenu.path])) {
            popup.alert(`화면[ ${selectedMenu.sname} ]이 존재하지 않습니다.`);
            return false;
        }

        userId.value = i.userId || '';
        params.value = i.params || {};

        const findTabItem = tabs.value.findIndex(
            (tab) => tab.menuSclsCd == selectedMenu.menuSclsCd,
        );

        if (findTabItem == -1) {
            menuName.value.push({
                lname: selectedMenu.lname,
                mname: selectedMenu.mname,
                sname: selectedMenu.sname,
                menuSclsCd: selectedMenu.menuSclsCd,
                path: selectedMenu.path,
                fileNm: selectedMenu.fileNm,
                progCd: selectedMenu.progCd,
            });

            tabs.value = [
                ...tabs.value,
                {
                    component: defineAsyncComponent(
                        modules[selectedMenu.path] as () => Promise<Component>,
                    ),
                    menuSclsCd: selectedMenu.menuSclsCd,
                    sname: selectedMenu.sname,
                    key: Date.now(),
                    refreshing: false,
                    params: i.params || i,
                },
            ];

            await nextTick();
            currentIndex.value = tabs.value.length - 1;
        } else {
            tabs.value = tabs.value.map((tab, idx) => {
                if (idx === findTabItem) {
                    return {
                        ...tab,
                        params: { ...i },
                    };
                }
                return tab;
            });

            currentIndex.value = findTabItem;
        }
        return true;
    } catch (error: any) {
        const errMsg = error?.message || error.toString();
        popup.alert(`${errMsg}\n새로고침 후 이용해주세요.`);
    }
};

const layoutSizeChanged = (e: boolean) => {
    if (!currentMenu.value) return;
    const elements = document.querySelectorAll(
        '[id^="aui-grid-wrap-"]:not([id="aui-grid-wrap-0"])',
    );
    const array = Array.from(elements).map((v: any) => ({ id: v.id, width: v.clientWidth }));

    const contWrapWidth = document.getElementsByClassName('cont_wrap').item(0)?.clientWidth || 0;
    nowWidth.value = contWrapWidth;
    const girdParent = array.map(({ id, width }) => {
        const ratio = width / contWrapWidth;
        const widthP = width + ratio * calcSize.value;
        const widthM = width - ratio * calcSize.value;
        return { id, widthP, widthM };
    });

    girdParent.forEach(({ id, widthP, widthM }) => {
        const targetWidth = e ? widthM : widthP;
        window.AUIGrid?.resize(`#${id}`, targetWidth);
    });
};

const removeTab = (index: number) => {
    if (tabs.value.length == 0) return;

    if (index >= 0) {
        const nextTabs = [...tabs.value];
        nextTabs.splice(index, 1);
        tabs.value = nextTabs;

        menuName.value.splice(index, 1);

        if (currentIndex.value === 0) {
            currentIndex.value = 0;
        } else if (currentIndex.value >= index) {
            --currentIndex.value;
        }
    } else {
        tabs.value = [];
        menuName.value = [];
        currentIndex.value = -1;
    }

    emit('menuSet', currentMenu.value);
};

// 💡 컨텍스트 메뉴 내 특정 기능 핸들러
const refreshTab = (index: number) => {
    // 탭이 존재하는지만 방어 코드로 체크하고 target 변수 선언은 제거합니다.
    if (!tabs.value[index]) return;

    tabs.value = tabs.value.map((tab, idx) => {
        if (idx === index) {
            return { ...tab, key: Date.now(), refreshing: true };
        }
        return tab;
    });

    setTimeout(() => {
        tabs.value = tabs.value.map((tab, idx) => {
            if (idx === index) return { ...tab, refreshing: false };
            return tab;
        });
    }, 300);
    hideContextMenu();
};

const tabLeft = () => {
    if (tabs.value.length <= 1 || currentIndex.value === 0) return;
    --currentIndex.value;
};

const tabRight = () => {
    if (tabs.value.length <= 1 || currentIndex.value === tabs.value.length - 1) return;
    ++currentIndex.value;
};

const favoriteToggle = (b: boolean) => {
    emit('favoriteToggleEmit', b);
};

const handleDragStart = (index: number) => {
    draggingIndex.value = index;
};

const handleDragOver = (index: number) => {
    if (draggingIndex.value === -1 || index === draggingIndex.value) return;

    const nextTabs = [...tabs.value];
    nextTabs.splice(index, 0, nextTabs.splice(draggingIndex.value, 1)[0]!);
    tabs.value = nextTabs;

    menuName.value.splice(index, 0, menuName.value.splice(draggingIndex.value, 1)[0]);
    currentIndex.value = index;
    draggingIndex.value = index;
};

const handleDragEnd = () => {
    draggingIndex.value = -1;
    emit('menuSet', currentMenu.value);
};

const homeView = () => {
    currentIndex.value = -1;
    emit('menuSet', currentMenu.value);
};

defineExpose({
    addTab,
    layoutSizeChanged,
    favoriteToggle,
});

// ==================================================
// 생명주기 및 감시자 (Lifecycle & Watch)
// ==================================================
onUpdated(() => {
    const elements = document.querySelectorAll(
        '[id^="aui-grid-wrap-"]:not([id="aui-grid-wrap-0"])',
    );
    const contEl = document.getElementsByClassName('cont_wrap');

    if (elements.length > 0 && contEl.length !== 0) {
        if (!currentMenu.value) return;
        const array = Array.from(elements).map((v: any) => ({ id: v.id, width: v.clientWidth }));
        const contWrapWidth = contEl.item(0)?.clientWidth || 0;

        const girdParent = array.map(({ id, width }) => {
            const ratio = width / contWrapWidth;
            const hasGridChanged =
                nowWidth.value === contWrapWidth ||
                (nowWidth.value >= contWrapWidth + 20 && nowWidth.value <= contWrapWidth + 30);
            const widthP = hasGridChanged ? width + ratio * calcSize.value : width;
            const widthM = hasGridChanged ? width - ratio * calcSize.value : width;
            return { id, widthP, widthM };
        });

        // 💡 주입 데이터 언래핑 언더 가드 보정
        const isHide =
            typeof hideToggle === 'object' && 'value' in hideToggle
                ? hideToggle.value
                : !!hideToggle;

        girdParent.forEach(({ id, widthP, widthM }) => {
            const targetWidth = isHide ? widthM : widthP;
            window.AUIGrid?.resize(`#${id}`, targetWidth);
        });
    }
});

onBeforeUnmount(() => {
    contextMenuControl(false);
});

watch(currentIndex, (newIndex) => {
    if (tabs.value.length === newIndex) return;
    if (newIndex >= 0) {
        scrollToTab(newIndex);
    }
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
                    :key="tab.menuSclsCd"
                    :ref="
                        (el) => {
                            if (el) tabList[index] = el as HTMLElement;
                        }
                    "
                    :class="[
                        currentIndex === index ? 'on' : 'off',
                        tab.refreshing ? 'tab-refreshing' : '',
                    ]"
                    draggable="true"
                    @contextmenu.prevent="showContextMenu($event, tab, index)"
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
                @click.stop.prevent="removeTab(currentIndex)"
            >
                <span>CLOSE</span>
            </button>
            <button
                type="button"
                class="allClose2"
                title="모든 탭 닫기"
                @click.stop.prevent="removeTab(-1)"
            >
                <span>CLOSE ALL</span>
            </button>
        </div>
    </div>

    <ul
        v-if="isContextMenuVisible"
        class="context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px', background: '#fff' }"
    >
        <li
            class="aui-grid-context-item"
            style="padding: 8px 14px; cursor: pointer"
            @click="refreshTab(contextIndex)"
        >
            🔄 현재 탭 새로고침
        </li>
        <li
            class="aui-grid-context-item"
            style="padding: 8px 14px; cursor: pointer; color: red"
            @click="removeTab(contextIndex)"
        >
            ❌ 현재 탭 닫기
        </li>
    </ul>

    <Suspense>
        <template #default>
            <div id="container">
                <KeepAlive>
                    <Component
                        :is="currentTabComponent"
                        :key="currentTabKey"
                        :menu-info="currentMenu"
                        :params="tabs[currentIndex]?.params || {}"
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
/* 기존 주신 스타일 보존 */
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
