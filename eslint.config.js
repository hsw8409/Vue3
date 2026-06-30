import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
    {
        // 1. 자동 생성 파일 무시 규칙 정리 (필요 없는 것 삭제)
        ignores: ['src/static/AUIGrid/**/*', 'dist/**/*', 'node_modules/**/*'],
    },
    {
        files: ['eslint.config.js', 'vite.config.ts'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
        },
    },

    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],

    {
        files: ['src/**/*.{vue,ts,js}'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
                extraFileExtensions: ['.vue'],
            },
            // 2. autoImportGlobals 제거: 이제 명시적 import를 사용하므로 필요 없습니다.
            globals: {
                ...globals.browser,
            },
        },

        plugins: {
            vue: pluginVue,
            '@typescript-eslint': tsPlugin,
            import: importPlugin,
        },

        settings: {
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                    alwaysTryTypes: true,
                },
                node: {
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'],
                },
            },
        },

        rules: {
            // 3. 자동 임포트 비활성화 규칙 제거 및 표준 규칙으로 복구
            'vue/no-undef-components': 'error', // 컴포넌트 임포트 누락 시 에러 발생시킴
            'no-undef': 'error', // 정의되지 않은 변수 사용 시 에러

            'import/no-unresolved': 'error',
            'import/named': 'error',

            '@typescript-eslint/no-explicit-any': 'off',
            'spaced-comment': 'off',
            'lines-around-comment': 'off',

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'no-unused-vars': 'off',
        },
    },

    eslintConfigPrettier,
];
