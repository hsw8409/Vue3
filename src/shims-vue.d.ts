declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
    export default component;
}

// Vue 템플릿 내에서 사용하는 커스텀 속성들을 전역적으로 허용합니다.
import 'vue';

declare module 'vue' {
    interface HTMLAttributes {
        // 팝업 드래그 및 식별을 위한 커스텀 속성
        'data-popup-id'?: string;
    }
}
