import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import fs from 'fs';

// unplugin-auto-import가 만든 글로벌 변수 JSON 동적 로드
const autoImportPath = './.eslintrc-auto-import.json';
const autoImportGlobals = fs.existsSync(autoImportPath)
    ? JSON.parse(fs.readFileSync(autoImportPath, 'utf8')).globals
    : {};

const commonGlobals = {
    ...globals.browser,
    ...autoImportGlobals,
};

export default [
    {
        ignores: ['src/static/AUIGrid/**/*', 'components.d.ts', 'src/auto-imports.d.ts'],
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
            globals: {
                ...commonGlobals,
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
            // 🌟 [핵심] 자동 임포트를 사용하므로 undef-components 규칙 비활성화
            'vue/no-undef-components': 'off',

            // 자동 임포트 함수들은 import 문이 없어도 되도록 설정
            'no-undef': 'off',

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
