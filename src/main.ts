/*
 * @file     main.ts
 * @menu     Application Bootstrap
 * @author   astems
 * @since    2026-06-15
 * @version  1.0
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import mitt from 'mitt';

import App from '@/App.vue';
import router from '@/routers';
import i18n from '@/i18n';
import apiInterceptors from '@/common/axios/interceptors';

import ComInput from '@/components/form/ComInput.vue';
import ComCheckbox from '@/components/form/ComCheckbox.vue';
import ComButton from '@/components/form/ComButton.vue';
import MenuContent from '@/components/menu/MenuContent.vue';

import '@/assets/main.css';

/* =====================
   1. App 인스턴스 생성
===================== */
const app = createApp(App);

/* =====================
   2. 상태 관리 (Pinia) 및 플러그인 등록
===================== */
app.use(createPinia());
app.use(router);
app.use(i18n); // 다국어

/* =====================
   3. 이벤트 버스 (Event Bus / mitt) 설정
===================== */
const emitter = mitt();
apiInterceptors(emitter);

// 컴포넌트 전역에서 'this.$emitter' 혹은 inject를 통해 접근할 수 있도록 인스턴스 프로퍼티에 등록
app.config.globalProperties.$emitter = emitter;

/* =====================
   global components
===================== */
app.component('MenuContent', MenuContent);

app.component('ComInput', ComInput);
app.component('ComCheckbox', ComCheckbox);
app.component('ComButton', ComButton);

/* =====================
   mount
===================== */
app.mount('#app');
