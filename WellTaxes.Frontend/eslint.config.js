import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from "globals";

export default tseslint.config([
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            globals: {
                document: 'readonly',
                window: 'readonly',
                navigator: 'readonly',
                process: 'readonly',
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: ['./tsconfig.app.json', './tsconfig.node.json'],
                tsconfigRootDir: process.cwd(),
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            'react/jsx-props-no-spreading': 'off',
            'react/require-default-props': 'off',
            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true},
            ],
            '@typescript-eslint/no-non-null-assertion': 'off',
            'semi': ['error', 'always'],
            'object-curly-spacing': ['error', 'always', {arraysInObjects: false}],
            'simple-import-sort/imports': 'error',
            'eol-last': ['error', 'always'],
            'quotes': ['error', 'single'],
            '@typescript-eslint/explicit-function-return-type': [
                'warn',
                // {
                //     allowExpressions: true,
                //     allowTypedFunctionExpressions: true,
                //     allowHigherOrderFunctions: true,
                //     allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                // },
            ],
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            'no-extra-boolean-cast': 'off',
            'no-console': ['error', {allow: ['warn', 'error']}],
        },
    },
]);
