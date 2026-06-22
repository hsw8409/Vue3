declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    // 빈 객체 {} 대신에 명시적으로 컴포넌트 타입을 정의합니다.
    // Record<string, unknown>을 사용하여 객체임을 보장합니다.
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
    export default component;
}
