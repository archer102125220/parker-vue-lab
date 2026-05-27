import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';

import { getLocalLanguage } from '@src/utils/third-party/get-local-language';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from '@src/composables/useWindowSize';
import { defaultLang } from '@src/i18n';

export interface DialogProps {
  hideTitle?: boolean;
  mask?: boolean;
  unmountOnClose?: boolean;
  maskClosable?: boolean;
  hideCancel?: boolean;
  okText?: string | null;
  cancelText?: string | null;
  onbeforeOk?: (() => boolean | Promise<boolean>) | null;
  onbeforeCancel?: (() => boolean | Promise<boolean>) | null;
}

export interface DialogState {
  trigger: boolean;
  width: string | number | null;
  bgColor: string;
  radius: string;
  content: string | null;
  contentClass: string | string[] | Record<string, boolean> | null;
  contentProps: Record<string, unknown> | null;
  dialogProps: DialogProps | null;
}

export interface SystemState {
  loading: boolean;
  windowInnerWidth: number;
  windowInnerHeight: number;
  isMobile: boolean;
  isTabletOnly: boolean;
  isTablet: boolean;
  dialog: DialogState;
}

export interface BrowserInfo {
  type: string;
  version: string;
  isEdge: boolean;
  isIe: boolean;
  isFirefox: boolean;
  isChrome: boolean;
  isOpera: boolean;
  isSafari: boolean;
  isAndroid: boolean;
  isIos: boolean;
  isIphone: boolean;
  isIpad: boolean;
  isStandalone: boolean;
  isDesktop: boolean;
  isWechat: boolean;
  notBroswer: boolean;
  userAgent: string;
}

const DIALOG_PROPS: DialogProps = {
  hideTitle: true,
  mask: true,
  unmountOnClose: true,
  maskClosable: true,
  hideCancel: true,
  okText: null,
  cancelText: null,
  onbeforeOk: null,
  onbeforeCancel: null
};

export const useSystemStore = defineStore('system', {
  state: (): SystemState => ({
    loading: false,
    windowInnerWidth: DEFAULT_WIDTH,
    windowInnerHeight: DEFAULT_HEIGHT,
    isMobile: false,
    isTabletOnly: false,
    isTablet: false,
    dialog: {
      trigger: false,
      width: null,
      bgColor: '#fff',
      radius: '4px',
      content: null,
      contentClass: null,
      contentProps: null,
      dialogProps: null
    }
  }),
  actions: {
    setLoading(payload: boolean) {
      this.loading = payload;
    },
    setIsMobile(payload: boolean = false) {
      this.isMobile = payload;
    },
    setIsTablet(payload: boolean = false) {
      this.isTablet = payload;
    },
    setIsTabletOnly(payload: boolean = false) {
      this.isTabletOnly = payload;
    },
    setWindowInnerSize(
      payload: {
        width?: number;
        height?: number;
        isMobile?: boolean;
        isTabletOnly?: boolean;
        isTablet?: boolean;
      } = {}
    ) {
      const {
        width = DEFAULT_WIDTH,
        height = DEFAULT_HEIGHT,
        isMobile = false,
        isTabletOnly = false,
        isTablet = false
      } = payload;
      this.windowInnerWidth = width;
      this.windowInnerHeight = height;
      this.isMobile = isMobile;
      this.isTabletOnly = isTabletOnly;
      this.isTablet = isTablet;
    },
    setDialog(payload: Partial<DialogState> = {}) {
      const _payload: DialogState = {
        trigger: false,
        width: null,
        bgColor: '#fff',
        radius: '4px',
        content: null,
        contentClass: null,
        contentProps: null,
        dialogProps: null,
        ...payload
      };
      _payload.dialogProps = {
        ...DIALOG_PROPS,
        ...(_payload.dialogProps || {})
      };
      this.dialog = _payload;
    }
  },
  getters: {
    broswerInfo(): BrowserInfo {
      const broswerInfo: BrowserInfo = {
        type: '',
        version: '',
        isEdge: false,
        isIe: false,
        isFirefox: false,
        isChrome: false,
        isOpera: false,
        isSafari: false,
        isAndroid: false,
        isIos: false,
        isIphone: false,
        isIpad: false,
        isStandalone: false,
        isDesktop: false,
        isWechat: false,
        notBroswer: typeof window === 'undefined',
        userAgent: ''
      };
      if (typeof window === 'undefined') {
        return broswerInfo;
      }
      broswerInfo.userAgent = window?.navigator?.userAgent || '';
      const userAgent = broswerInfo.userAgent.toLowerCase();

      broswerInfo.isDesktop = ['windows nt', 'macintosh', 'x11'].some(
        (keyword) => userAgent.includes(keyword)
      );
      broswerInfo.isAndroid = userAgent.includes('android');
      broswerInfo.isIphone = userAgent.includes('iphone');
      broswerInfo.isIpad = userAgent.includes('ipad');
      broswerInfo.isIos = broswerInfo.isIphone || broswerInfo.isIpad;
      broswerInfo.isStandalone =
        // @ts-ignore
        window.navigator?.standalone === true ||
        window.matchMedia?.('(display-mode: standalone)')?.matches === true;

      if (userAgent.match(/MicroMessenger/i)) {
        broswerInfo.type = 'Wechat';
        broswerInfo.version = 'N/A';
        broswerInfo.isWechat = true;
      } else if (userAgent.match(/edge\/([\d.]+)/)) {
        broswerInfo.type = 'Edge';
        const match = userAgent.match(/edge\/([\d.]+)/);
        broswerInfo.version = (match ? match[1] : null) || '';
        broswerInfo.isEdge = true;
      } else if (
        userAgent.match(/rv:([\d.]+)\) like gecko/) ||
        userAgent.match(/msie ([\d.]+)/)
      ) {
        const _version =
          userAgent.match(/rv:([\d.]+)\) like gecko/) ||
          userAgent.match(/msie ([\d.]+)/);

        broswerInfo.type = 'IE';
        broswerInfo.version = (_version ? _version[1] : null) || '';
        broswerInfo.isIe = true;
      } else if (userAgent.match(/firefox\/([\d.]+)/)) {
        broswerInfo.type = 'Firefox';
        const match = userAgent.match(/firefox\/([\d.]+)/);
        broswerInfo.version = (match ? match[1] : null) || '';
        broswerInfo.isFirefox = true;
      } else if (userAgent.match(/chrome\/([\d.]+)/)) {
        broswerInfo.type = 'Chrome';
        const match = userAgent.match(/chrome\/([\d.]+)/);
        broswerInfo.version = (match ? match[1] : null) || '';
        broswerInfo.isChrome = true;
      } else if (userAgent.match(/opera.([\d.]+)/)) {
        broswerInfo.type = 'Opera';
        const match = userAgent.match(/opera.([\d.]+)/);
        broswerInfo.version = (match ? match[1] : null) || '';
        broswerInfo.isOpera = true;
      } else if (userAgent.match(/version\/([\d.]+).*safari/)) {
        broswerInfo.type = 'Safari';
        const match = userAgent.match(/version\/([\d.]+).*safari/);
        broswerInfo.version = (match ? match[1] : null) || '';
        broswerInfo.isSafari = true;
      }

      return broswerInfo;
    },
    localLanguage(): string {
      const i18n = useI18n();
      const locale =
        typeof i18n.locale.value === 'string' ? i18n.locale.value : defaultLang;
      return getLocalLanguage(locale);
    }
  }
});

export default useSystemStore;
