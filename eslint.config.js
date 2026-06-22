import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import fs from 'fs'; // 🌟 추가: 파일 존재 여부 체크용

// 🌟 [추가] unplugin-auto-import가 만든 글로벌 변수 JSON 동적 로드
const autoImportPath = './.eslintrc-auto-import.json';
const autoImportGlobals = fs.existsSync(autoImportPath)
    ? JSON.parse(fs.readFileSync(autoImportPath, 'utf8')).globals
    : {};

const commonGlobals = {
    ...globals.browser,
    ...autoImportGlobals, // 🌟 브라우저 전역 변수들과 함께 플러그인 변수 주입!
};

export default [
    {
        ignores: ['src/static/AUIGrid/**/*'],
    },
    // 1. ESLint 설정 파일 및 JS 설정 파일에 대한 예외 처리 (TS 검사 제외)
    {
        files: ['eslint.config.js', 'vite.config.ts'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
        },
    },

    // 2. JS 표준 추천 규칙
    js.configs.recommended,

    // 3. Vue 플러그인의 v9 플랫 설정 결합
    ...pluginVue.configs['flat/recommended'],

    // 4. 프로젝트 소스 코드(Vue, TS, JS)에 대한 규칙
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
            globals: commonGlobals, // 🌟 수정된 글로벌 변수가 적용됩니다.
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
                // 🌟 중요: Node 해석기 영역에 확장자 매핑 순서를 명확히 강제합니다.
                node: {
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'],
                },
            },
            // 🌟 중요: import/extensions 규칙이 지원할 확장자 목록을 명시합니다.
            'import/extensions': ['.ts', '.tsx', '.js', '.jsx', '.vue'],
        },

        rules: {
            // [핵심] 템플릿 내에 등록/임포트되지 않은 컴포넌트 사용 시 에러 발생!
            'vue/no-undef-components': [
                'error',
                {
                    ignorePatterns: [
                        'router-link',
                        'router-view',
                        'MenuContent',
                        'ComInput',
                        'ComCheckbox',
                        'ComButton',
                    ],
                },
            ],

            // 없는 파일 import 시 에러 발생
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

    // 5. Prettier 충돌 방지
    eslintConfigPrettier,
];
