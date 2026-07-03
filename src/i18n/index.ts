/*
 * @file     i18n/index.ts
 * @menu     다국어 index
 * @author   astems
 * @since    2026-07-02
 * @version  1.0
 */
// =====================================================================================================
// import 영역
// =====================================================================================================
import { createI18n } from 'vue-i18n';
import ko from '@/i18n/messages/ko.json';

const i18n = createI18n({
    legacy: false,
    locale: 'ko',
    messages: {
        ko,
    },
});

export default i18n;
