/**
 * @file     main.ts
 * @menu     Application Bootstrap
 * @author   astems
 * @since    2026-06-15
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import mitt from 'mitt';

import App from '@/App.vue';
import router from '@/routers';
import i18n from '@/i18n';
import apiInterceptors from '@/common/axios/interceptors';
import { saveAs } from 'file-saver';

import './assets/main.css';
/* =====================
   1. App 인스턴스 생성
===================== */

(window as any).saveAs = saveAs;

const app = createApp(App);

/* =====================
   2. 상태 관리 (Pinia) 및 플러그인 등록
===================== */
const pinia = createPinia();
app.use(pinia);

app.use(router);
app.use(i18n);

/* =====================
   3. 이벤트 버스 (Event Bus / mitt) 설정
===================== */
const emitter = mitt();
apiInterceptors(emitter);
app.provide('emitter', emitter);

/* =====================
   4. mount
===================== */
app.mount('#app');
