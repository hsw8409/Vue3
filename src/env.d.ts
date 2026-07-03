/// <reference types="vite/client" />
import '@vue/runtime-dom';
declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare global {
    interface Window {
        AUIGrid?: any;
    }
}

declare module '@vue/runtime-dom' {
    interface HTMLAttributes {
        'data-popup-id'?: string;
    }
}

import { Emitter } from 'mitt';
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $emitter: Emitter<any>;
    }
}

declare module 'file-saver';

export {};
