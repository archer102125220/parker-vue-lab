/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

interface Window {
  ___IS_VUE_INITED__?: boolean;
  originalConsoleError?: (...args: unknown[]) => void;
  __UNIVER__DOC_LOCKED_ERROR_FILTERED__?: boolean;
  __UNIVER__SHEET_LOCKED_ERROR_FILTERED__?: boolean;
}

interface ImportMetaEnv {
  readonly VITE_UNIVER_LICENSE?: string;
  readonly VITE_UNIVERSER_PROXY_PATH?: string;
  readonly VITE_UNIVERSER_DOCKER_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
