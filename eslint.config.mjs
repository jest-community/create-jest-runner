import { globalIgnores, defineConfig } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig(
  globalIgnores(['**/build/']),
  eslint.configs.recommended,
  // eslint-disable-next-line import-x/no-named-as-default-member
  tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...jest.environments.globals.globals,
      },
    },
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/__tests__/**/*',
            'eslint.config.mjs',
            'babel.config.js',
          ],
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/prefer-ts-expect-error': 'error',
    },
  },
  {
    files: ['integrationTests/__fixtures__/**/*'],

    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.js'],

    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
);
