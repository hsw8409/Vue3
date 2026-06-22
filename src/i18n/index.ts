import { createI18n } from "vue-i18n";
import ko from "@/i18n/messages/ko.json";
if (typeof __VUE_I18N_FULL_INSTALL__ === "undefined") {
    globalThis.__VUE_I18N_FULL_INSTALL__ = true;
    globalThis.__VUE_I18N_LEGACY_API__ = false;
    globalThis.__INTLIFY_PROD_DEVTOOLS__ = false;
}
const i18n = createI18n({
    legacy: false,
    locale: "ko",
    messages: {
        ko,
    },
});

export default i18n;
