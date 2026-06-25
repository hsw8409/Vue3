/* eslint-disable no-undef */

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

export default defineConfig(({ mode }) => {
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
            // 🌟 API 자동 임포트 설정
            AutoImport({
                imports: [
                    'vue',
                    'vue-router',
                    {
                        'vue-i18n': ['useI18n'],
                    },
                ],
                dirs: ['src/common/stores'],
                dts: 'src/auto-imports.d.ts',
                eslintrc: {
                    enabled: true,
                    filepath: './.eslintrc-auto-import.json',
                },
            }),
            // 🌟 컴포넌트 자동 임포트 설정 (Ctrl+클릭 지원)
            Components({
                dirs: ['src/components'], // 자동 등록할 컴포넌트 폴더
                dts: 'components.d.ts', // 타입 정의 파일 생성
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
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                '@common': fileURLToPath(new URL('./src/common', import.meta.url)),
                '/@views': fileURLToPath(new URL('./src/views', import.meta.url)),
            },
        },
        build: {
            outDir: 'dist',
            assetsDir: 'static',
            chunkSizeWarningLimit: 5000,
            emptyOutDir: true,
            sourcemap: false,
        },
        clearScreen: true,
        logLevel: 'info',
        server: {
            host: '0.0.0.0',
            port: Number(env.VITE_PORT) || 3001,
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
