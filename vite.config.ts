/* eslint-disable no-undef */

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite'; // 🌟 [추가] 자동 임포트 플러그인 가져오기

export default defineConfig(({ mode }) => {
    // 🌟 mode별 환경변수 로드
    const env = loadEnv(mode, process.cwd());

    return {
        define: {
            global: 'globalThis',
            __VUE_I18N_LEGACY_API__: false,
            __VUE_I18N_FULL_INSTALL__: true,
            __INTLIFY_PROD_DEVTOOLS__: false,
        },
        plugins: [
            vue(),
            // 🌟 [추가] unplugin-auto-import 설정 영역
            AutoImport({
                // 🎯 기존 'vue-i18n' 문자열 대신 객체 형태로 함수명을 정확히 찝어줍니다.
                // 이렇게 해야 Vite 빌드 타임에 useI18n 코드가 빠짐없이 런타임 주입됩니다.
                imports: [
                    {
                        'vue-i18n': ['useI18n'],
                    },
                ],
                dirs: [
                    // './src/common/stores/**', 🌟 이 생성 경로 지정 부분을 삭제하거나 주역 처리하세요!
                ],
                dts: 'src/auto-imports.d.ts',
                // 🌟 eslint 연동
                eslintrc: {
                    enabled: true, // 생성 활성화
                    filepath: './.eslintrc-auto-import.json', // 파일 위치
                },
            }),
            {
                name: 'project-name-banner',
                configureServer(server) {
                    const projectName = '[[[   Astems Vue3   ]]]';
                    const originalPrint = server.printUrls;
                    server.printUrls = () => {
                        console.log('\n=============================');
                        console.log(`${projectName}`);
                        console.log('=============================\n');

                        originalPrint();
                    };
                },
            },
        ],
        base: '/',
        resolve: {
            alias: {
                // 🌟 모던 Node.js 및 TS 호환성이 높은 fileURLToPath 기반 Alias 세팅 반영
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                '@common': fileURLToPath(new URL('./src/common', import.meta.url)),
                '/@views': fileURLToPath(new URL('./src/views', import.meta.url)),
            },
        },
        build: {
            outDir: 'dist',
            assetsDir: 'static',
            chunkSizeWarningLimit: 5000,
            emptyOutDir: true, // 캐시 비우기
            // 🌟 실서버 배포 시 원본 소스 코드가 브라우저 F12에 노출되는 것을 방지
            sourcemap: false,
        },
        clearScreen: true,
        logLevel: 'info',
        server: {
            host: '0.0.0.0',
            port: Number(env.VITE_PORT) || 3001, // SMS 포트 (TS 호환을 위해 Number 변환)
            proxy: {
                '/api': {
                    target: env.VITE_BACKEND_URL || 'http://localhost:9081',
                    changeOrigin: true,
                    secure: false,
                },
                '/ws-scale': {
                    target: env.VITE_BACKEND_URL || 'http://localhost:9081',
                    changeOrigin: true,
                    ws: true,
                },
            },
        },
    };
});
