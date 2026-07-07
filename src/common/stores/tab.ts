/**
 * @file     /stores/tab.ts
 * @menu     탭메뉴 관련 store
 * @author   astems
 * @since    2026-07-06
 * @version  1.0
 *
 * @description
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { defineStore } from 'pinia';
import { ref, markRaw, computed } from 'vue';

import type { Component } from 'vue';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================
interface TabItem {
    mcd: string;
    sname: string;
    lname?: string;
    mname?: string;
    path?: string;
    fileNm?: string;
    component?: Component;
    key: string;
    params?: Record<string, unknown>;
}

interface OpenTabParam {
    mcd: string;
    sname: string;
    lname?: string;
    mname?: string;
    path?: string;
    fileNm?: string;
    component?: Component;
    params?: Record<string, unknown>;
}

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const useTabStore = defineStore('tab', () => {
    const tabs = ref<TabItem[]>([]);
    const activeIndex = ref<number>(-1);

    const createTabKey = () => `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const activeTab = computed<TabItem | undefined>(() => {
        return tabs.value[activeIndex.value];
    });

    const findTabIndex = (mcd: string) => {
        return tabs.value.findIndex((tab) => tab.mcd === mcd);
    };

    const hasTab = (mcd: string) => {
        return findTabIndex(mcd) !== -1;
    };

    const openTab = (tab: OpenTabParam) => {
        const idx = findTabIndex(tab.mcd);

        /**
         * 기존 탭이면 활성화만 처리
         */
        if (idx !== -1) {
            const targetTab = tabs.value[idx];

            // 방어 코드 추가
            if (!targetTab) return;

            // 새로운 객체로 교체하여 반응성 보장
            tabs.value[idx] = {
                ...targetTab,
                params: {
                    ...(targetTab.params || {}), // 기존 params가 undefined일 경우를 대비
                    ...tab.params,
                },
            };

            activeIndex.value = idx;
            return;
        }

        /**
         * 신규 탭
         */
        tabs.value.push({
            ...tab,
            component: tab.component ? markRaw(tab.component) : undefined,
            key: createTabKey(),
            params: tab.params ?? {},
        });

        activeIndex.value = tabs.value.length - 1;
    };

    const setActive = (index: number) => {
        if (index < 0 || index >= tabs.value.length) {
            return;
        }

        activeIndex.value = index;
    };

    const closeTab = (index: number) => {
        if (index < 0 || index >= tabs.value.length) {
            return;
        }

        tabs.value.splice(index, 1);

        /**
         * 활성 Index 보정
         */
        if (tabs.value.length === 0) {
            activeIndex.value = -1;

            return;
        }

        if (activeIndex.value >= index) {
            activeIndex.value = Math.max(0, activeIndex.value - 1);
        }
    };

    const closeAll = () => {
        tabs.value = [];

        activeIndex.value = -1;
    };

    const moveTab = (from: number, to: number) => {
        if (
            from === to ||
            from < 0 ||
            to < 0 ||
            from >= tabs.value.length ||
            to >= tabs.value.length
        ) {
            return;
        }

        const target = tabs.value.splice(from, 1)[0];

        if (target) {
            tabs.value.splice(to, 0, target);

            activeIndex.value = to;
        }
    };

    const updateParams = (index: number, params: Record<string, unknown>) => {
        const tab = tabs.value[index];

        if (tab) {
            tabs.value[index] = {
                ...tab,
                params,
            };
        }
    };

    const home = () => {
        activeIndex.value = -1;
    };

    const moveLeft = () => {
        if (tabs.value.length <= 1 || activeIndex.value <= 0) {
            return;
        }

        activeIndex.value--;
    };

    const moveRight = () => {
        if (tabs.value.length <= 1 || activeIndex.value >= tabs.value.length - 1) {
            return;
        }

        activeIndex.value++;
    };

    return {
        // state
        tabs,
        activeIndex,

        // getter
        activeTab,
        findTabIndex,
        hasTab,

        // action
        openTab,
        setActive,
        closeTab,
        closeAll,
        moveTab,
        updateParams,
        home,
        moveLeft,
        moveRight,
    };
});
