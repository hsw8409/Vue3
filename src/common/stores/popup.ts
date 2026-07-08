/**
 * @file     /common/stores/popup.ts
 * @menu     팝업 관련 store
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { defineStore } from 'pinia';
import { ref, markRaw, Component } from 'vue';
import PopupMessage from '@/common/utils/popup/PopupMessage.vue';
import type { PopupProps, PopupMessageProps } from '@/types/popup';

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const usePopupStore = defineStore('popup', () => {
    // State
    const popups = ref<PopupProps[]>([]);

    const popupModules = import.meta.glob([
        '/src/views/popup/*.vue',
        '/src/components/popup/*.vue',
    ]);

    // Actions
    const openPopup = (
        type: 'message' | 'biz',
        componentOrName: Component | string,
        props?: Record<string, any>,
    ) => {
        const id = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const popupPromise = new Promise((resolve) => {
            if (type === 'biz' && typeof componentOrName !== 'string') {
                return resolve(null);
            }
            if (type === 'message' && typeof componentOrName === 'string') {
                return resolve(null);
            }

            if (type === 'biz') {
                const viewsPath = `/src/views/popup/${componentOrName}.vue`;
                const componentsPath = `/src/components/popup/${componentOrName}.vue`;
                let targetPath = '';

                if (popupModules[viewsPath]) {
                    targetPath = viewsPath;
                } else if (popupModules[componentsPath]) {
                    targetPath = componentsPath;
                }

                if (!targetPath) {
                    return resolve(null);
                }

                import('@/common/utils').then(({ utils }) => {
                    utils.component
                        .load(targetPath)
                        .then((finalComponent) => {
                            if (!finalComponent) throw new Error('파일 로드 결과가 null입니다.');

                            popups.value.push({
                                id: id,
                                type,
                                component: markRaw(finalComponent),
                                props: { ...props, id },
                                resolve,
                            });
                        })
                        .catch((error) => {
                            console.error(
                                `[popupStore] 업무용 팝업 동적 로드 실패: ${targetPath}`,
                                error,
                            );
                            resolve(null);
                        });
                });
            } else {
                popups.value.push({
                    id: id,
                    type,
                    component: markRaw(componentOrName as Component),
                    props: { ...props, id },
                    resolve,
                });
            }
        });

        return { id, popupPromise };
    };

    const alert = (message: string, title?: string, options?: Partial<PopupMessageProps>) => {
        return openPopup('message', PopupMessage, {
            title,
            message,
            buttonType: 'alert',
            okText: '확인',
            ...options,
        });
    };

    const confirm = (message: string, title?: string, options?: Partial<PopupMessageProps>) => {
        return openPopup('message', PopupMessage, {
            title,
            message,
            buttonType: 'confirm',
            okText: '예',
            cancelText: '아니오',
            ...options,
        });
    };

    const closePopup = (id: string, result: any = null) => {
        const target = popups.value.find((p) => p.id === id);

        if (!target) {
            console.warn(`[popupStore] 종료하려는 팝업 ID가 존재하지 않습니다: ${id}`);
            return;
        }

        if (target.resolve) {
            target.resolve(result);
        }

        popups.value = popups.value.filter((p) => p.id !== id);
    };

    const closeAllPopups = (result: any = null) => {
        popups.value.forEach((popup) => {
            if (popup.resolve) {
                popup.resolve(result);
            }
        });

        popups.value = [];
    };

    return {
        popups,
        openPopup,
        alert,
        confirm,
        closePopup,
        closeAllPopups,
    };
});
