import eslint from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import vueEslintParser from 'vue-eslint-parser';

export default tseslint.config(
  {
    files: ['*.vue', '**/*.vue', '*.ts', '**/*.ts', '*.js', '**/*.js'],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      vue: pluginVue
    },
    rules: {
      'vue/no-deprecated-destroyed-lifecycle': 1,
      'vue/no-v-for-template-key-on-child': 0,
      'vue/multi-word-component-names': 0,
      'no-extra-semi': 2,
      semi: [1, 'always'],
      quotes: [1, 'single', { avoidEscape: true }],
      'prefer-const': 2,
      'no-var': 2,
      'no-console': 0,
      'no-const-assign': 2,
      'no-useless-escape': 1,
      'unicorn/escape-case': 1,
      camelcase: 0,
      'vue/no-dupe-keys': 1,
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    ignores: ['node_modules', 'dist', 'public', '.yarn']
  }
);
