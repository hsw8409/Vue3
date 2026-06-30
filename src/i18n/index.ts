import { createI18n } from 'vue-i18n';
import ko from '@/i18n/messages/ko.json';

// globalThis.를 제거하고 전역 상수 그대로 사용합니다.
// Vite가 빌드 시점에 이 값들을 실제 값(true/false)으로 치환합니다.
if (typeof __VUE_I18N_FULL_INSTALL__ === 'undefined') {
    // 만약 이 체크가 꼭 필요하다면, 아래와 같이 'any'로 캐스팅하여
    // TypeScript가 타입 체크를 건너뛰게 할 수 있습니다.
    (globalThis as any).__VUE_I18N_FULL_INSTALL__ = true;
    (globalThis as any).__VUE_I18N_LEGACY_API__ = false;
    (globalThis as any).__INTLIFY_PROD_DEVTOOLS__ = false;
}

const i18n = createI18n({
    legacy: false,
    locale: 'ko',
    messages: {
        ko,
    },
});

export default i18n;
