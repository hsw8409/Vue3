import { Component } from 'vue';

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
