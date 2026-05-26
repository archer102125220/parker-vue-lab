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
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'vue': pluginVue
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    ignores: ['node_modules', 'dist', 'public', '.yarn']
  }
);
