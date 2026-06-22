// 1. Vite 클라이언트 타입 선언 (⚠️ 반드시 파일 최상단 위치)
/// <reference types="vite/client" />

import { Emitter } from 'mitt';

// 2. Vue 전역 인스턴스 프로퍼티 타입 확장 ($emitter)
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $emitter: Emitter<any>;
    }
}

// 🌟 3. 전역 Window 인터페이스 확장 (AUIGrid 에러 해결)
declare global {
    interface Window {
        AUIGrid?: any; // AUIGrid의 내부 메서드 타입들을 상세히 적거나 모를 땐 any 지정
    }
}
