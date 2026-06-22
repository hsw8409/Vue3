/*
 * @file     popup.ts
 * @menu     Popup Store
 * @author   astems
 * @since    2026-06-16
 * @version  1.0
 */
import { defineStore } from 'pinia';
import { ref, markRaw, Component } from 'vue';
import PopupMessage from '@/common/utils/popup/PopupMessage.vue';

/**
 * 메시지 팝업 옵션
 */
export interface PopupMessageProps {
    title?: string;
    message: string;
    buttonType?: 'alert' | 'confirm'; // 버튼 유형 alert , confirm
    okText?: string; // 확인 버튼
    cancelText?: string; // 취소 버튼
    onOk?: () => void; // 확인버튼 이벤트
    onCancel?: () => void; // 취소버튼 이벤트
}

export interface PopupProps {
    id: string;
    type: 'message' | 'biz';
    component: Component;
    props?: Record<string, any>;
    resolve?: (value: any) => void; // 🌟 팝업이 닫힐 때 부모에게 값을 돌려주기 위한 Promise Resolver 저장
}

export const usePopupStore = defineStore('popup', () => {
    const popups = ref<PopupProps[]>([]);

    // 🌟 [중요] 프로젝트 내 팝업 파일 목록을 런타임에 미리 매핑 (네트워크 404 에러 방지용)
    // Vite가 빌드 시점에 해당 경로의 실제 파일 존재 여부를 인덱싱합니다.
    const popupModules = import.meta.glob([
        '/src/views/popup/*.vue',
        '/src/components/popup/*.vue',
    ]);

    /**
     * 팝업 통합 호출 함수
     * @param type 팝업 유형 ('message' | 'biz')
     * @param componentOrName 'message'일 때는 Component 객체 / 'biz'일 때는 파일명 문자열
     * @param props 팝업에 전달할 데이터 객체
     */
    const openPopup = (
        type: 'message' | 'biz',
        componentOrName: Component | string,
        props?: Record<string, any>,
    ) => {
        // 🌟 익제큐터 함수는 순수 동기 함수로 유지합니다. (async 제거!)
        return new Promise((resolve) => {
            // 🚨 [방어 코드] 타입 불일치 사전 차단
            if (type === 'biz' && typeof componentOrName !== 'string') {
                return resolve(null);
            }
            if (type === 'message' && typeof componentOrName === 'string') {
                return resolve(null);
            }

            // 1. 업무용 팝업('biz') 분기 처리
            if (type === 'biz') {
                const viewsPath = `/src/views/popup/${componentOrName}.vue`;
                const componentsPath = `/src/components/popup/${componentOrName}.vue`;
                let targetPath = '';

                if (popupModules[viewsPath]) {
                    targetPath = viewsPath;
                } else if (popupModules[componentsPath]) {
                    targetPath = componentsPath;
                }

                console.info('팝업 targetPath>>>>', targetPath);

                if (!targetPath) {
                    return resolve(null);
                }

                // ⭕ [수정] 외부 유틸 라이브러리를 사용하기 직전에 비동기로 가져옵니다.
                // 이렇게 하면 파일 컴파일 시점에 순환 꼬임 현상이 100% 방지됩니다.
                import('@/common/utils').then(({ utils }) => {
                    utils.component
                        .load(targetPath)
                        .then((finalComponent) => {
                            if (!finalComponent) throw new Error('파일 로드 결과가 null입니다.');

                            popups.value.push({
                                id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                                type,
                                component: markRaw(finalComponent),
                                props,
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
            }

            // 2. 메시지 팝업('message') 분기 처리 (이미 로드된 동기 컴포넌트)
            else {
                popups.value.push({
                    id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    type,
                    component: markRaw(componentOrName as Component),
                    props,
                    resolve,
                });
            }
        });
    };

    /**
     * Alert 팝업
     * 기본:
     * [확인]
     */
    const alert = (message: string, title?: string, options?: Partial<PopupMessageProps>) => {
        return openPopup('message', PopupMessage, {
            title,
            message,
            buttonType: 'alert',
            // 기본값
            okText: '확인',
            ...options,
        });
    };

    /**
     * Confirm 팝업
     * 기본:
     * [예] [아니오]
     */
    const confirm = (message: string, title?: string, options?: Partial<PopupMessageProps>) => {
        return openPopup('message', PopupMessage, {
            title,
            message,
            buttonType: 'confirm',
            // 기본값
            okText: '예',
            cancelText: '아니오',
            ...options,
        });
    };

    /**
     * 특정 팝업 종료 및 데이터 반환 🌟
     * @param id 팝업 고유 ID
     * @param result 부모 화면으로 돌려보낼 값 (선택)
     */
    const closePopup = (id: string, result: any = null) => {
        const target = popups.value.find((p) => p.id === id);
        if (target && target.resolve) {
            target.resolve(result); // 🌟 대기 중이던 부모의 await 전선에 결과 전달!
        }
        popups.value = popups.value.filter((p) => p.id !== id);
    };

    /**
     * 🌟 [추가] 활성화된 모든 팝업 일괄 강제 종료
     * @param result 부모 대기 화면들로 일괄 반환할 기본값 (선택)
     */
    const closeAllPopups = (result: any = null) => {
        // 대기 중인 모든 Promise 구조를 순회하며 락(Lock)을 풀어줍니다.
        popups.value.forEach((popup) => {
            if (popup.resolve) {
                popup.resolve(result);
            }
        });

        // 팝업 스택 비우기
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
