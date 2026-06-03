import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse
} from 'axios';
import axios from 'axios';
// import qs from 'qs';
import { LRUCache } from 'lru-cache';

import cacheAdapterEnhancer from '@src/utils/request/axios-extensions';
// import cacheAdapterEnhancer from './axios-extensions';

import type {
  cancelRequestInterface,
  requestCancelerList,
  requestCanceler,
  requestInterface,
  requestParams,
  requestArg,
  errorAdapterType,
  cancelArg,
  requestKey,
  config
} from '@src/utils/request/request.d.ts';

const HAS_INIT = typeof window !== 'object';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

// https://www.hai-fe.com/docs/nuxt/apiCache.html
// https://www.npmjs.com/package/lru-cache
// api資料快取儲存物件
const cacheCfg: LRUCache<string, NonNullable<unknown>> = new LRUCache({
  ttl: 1000 * 60 * 10,
  max: 100
});

export class cancelRequest implements cancelRequestInterface {
  requestCancelerList: requestCancelerList = {};

  getRequestKey(method: string, url: string | undefined, params: unknown) {
    let requestKey = method.toLocaleLowerCase() + '|__|' + url;
    if (typeof params === 'object' && params !== null) {
      requestKey += '|__|' + JSON.stringify(params);
    }
    return requestKey;
  }

  addRequestCanceler(
    cancel: requestCanceler,
    method: string | undefined = 'GET',
    url: string | undefined,
    params: unknown
  ): void {
    const key = this.getRequestKey(method, url, params);
    this.requestCancelerList[key] = cancel;
  }

  getRequestCanceler(
    method: string = 'GET',
    url: string,
    params: unknown
  ): requestCanceler {
    const key = this.getRequestKey(method, url, params);
    return this.requestCancelerList[key] || null;
  }

  removeRequestCanceler(
    method: string | undefined = 'GET',
    url: string | undefined,
    params: unknown
  ): void {
    const key = this.getRequestKey(method, url, params);
    this.requestCancelerList[key] = null;
  }

  handlerCancel = (method: string = 'GET', url: string, params: unknown): void => {
    const key = this.getRequestKey(method, url, params);
    const requestCanceler: requestCanceler =
      this.requestCancelerList[key] || null;

    if (typeof requestCanceler === 'object' && requestCanceler !== null) {
      requestCanceler.abort();
      this.requestCancelerList[key] = null;
    }
  };

  handlerCancelAll = (): void => {
    const requestCancelerList: requestCancelerList = this.requestCancelerList;

    Object.keys(requestCancelerList).forEach((requestCancelerKey: string) => {
      const requestCanceler: requestCanceler =
        requestCancelerList[requestCancelerKey] || null;

      if (typeof requestCanceler === 'object' && requestCanceler !== null) {
        requestCanceler.abort();
        this.requestCancelerList[requestCancelerKey] = null;
      }
    });
  };
}

export const CancelRequest: cancelRequestInterface = new cancelRequest();

export function getCache(requestKey: requestKey = '', config?: Record<string, unknown>) {
  return cacheCfg.get(requestKey);
}
export function setCache(requestKey: requestKey = '', response: unknown, config?: Record<string, unknown>) {
  return cacheCfg.set(requestKey, response as NonNullable<unknown>);
}
export function deleteCache(requestKey: requestKey = '', config?: Record<string, unknown>) {
  return cacheCfg.delete(requestKey);
}
export function removeCache() {
  return cacheCfg.clear();
}

export let ax: AxiosInstance | null = null;

export function axiosInit(
  baseURL: string,
  errorAdapter?: errorAdapterType,
  defaultExtendOption?: Record<string, unknown>
) {
  ax = axios.create({
    baseURL,
    adapter: cacheAdapterEnhancer(
      {
        enabledByDefault: false,
        cacheFlag: 'useCache',
        getCache,
        setCache,
        deleteCache
      },
      function defaultAdapter(config: InternalAxiosRequestConfig) {
        delete config.adapter;
        return axios(config);
      }
    )
  });

  if (typeof window === 'undefined') {
    ax.interceptors.request.use(function (config: InternalAxiosRequestConfig) {
      let params = config.params;
      const _baseURL = config.baseURL || '';
      const configData = config.data;
      const token = config.headers?.token || config.headers?.ez1;
      if (configData && typeof configData === 'string') {
        params = JSON.parse(configData);
      } else if (configData) {
        params = configData;
      }
      let requestPath = 'request: ' + config.method + '__';
      if (config.url?.includes('http')) {
        requestPath += config.url;
      } else {
        requestPath += _baseURL + config.url;
      }
      if (typeof params === 'object' && params !== null) {
        requestPath += ' params: ' + JSON.stringify(params);
      }
      if (token) {
        requestPath += '__token:' + token;
      }
      console.log('\x1b[33m%s\x1b[0m ', requestPath);
      return config;
    });
  }

  ax.interceptors.request.use(function (config: InternalAxiosRequestConfig) {
    const controller = new AbortController();
    let params = config.params;
    const configData = config.data;
    if (configData && typeof configData === 'string') {
      params = JSON.parse(configData);
    } else if (configData) {
      params = configData;
    }
    const cfg = {
      ...config,
      signal: controller.signal
    };
    CancelRequest.addRequestCanceler(
      controller,
      config.method,
      config.url,
      params
    );
    return cfg;
  }, errorAdapter);
  request.ax = ax;
  request.axios = axios;
  request.baseURL = baseURL;
  request.errorAdapter = errorAdapter;
  request.defaultExtendOption = defaultExtendOption;

  return request;
}

export type responseSettingType = {
  returnRawResponse?: boolean;
  returnHeaders?: boolean;
};
export type responseType =
  | null
  | AxiosResponse
  | {
      data:
        | AxiosResponse['data']
        | {
            responseHeaders?: AxiosResponse['headers'];
          };
      headers: AxiosResponse['headers'];
    };
export interface responseConfigType extends InternalAxiosRequestConfig {
  responseSetting?: responseSettingType;
}
export const request: requestInterface = function (
  _method: string = 'GET',
  url: string,
  _params: Record<string, unknown> | undefined = {},
  _extendOption: Record<string, unknown> | undefined = {},
  hasErrorAdapter: boolean | undefined = true
) {
  const method: string = _method.toUpperCase();
  const defaultExtendOption = request.defaultExtendOption;
  let params: requestParams = {};

  let extendOption = _extendOption;
  if (typeof defaultExtendOption === 'function') {
    extendOption = (defaultExtendOption as unknown as Function)(_extendOption) || {};
  } else if (
    typeof defaultExtendOption === 'object' &&
    defaultExtendOption !== null
  ) {
    extendOption = { ...defaultExtendOption, ..._extendOption };
  }

  switch (method) {
    case (method.match(/POST|PUT|PATCH/) || {}).input:
      params.data = _params;
      break;
    case (method.match(/GET/) || {}).input:
      params.params = _params;
      break;
    case 'DELETE':
      // params.params = _params;
      params.data = _params;
      break;
    default:
      params = {};
      break;
  }

  if (extendOption.useServiceWorkerCache === true) {
    if (
      typeof extendOption.headers === 'object' &&
      extendOption.headers !== null
    ) {
      (extendOption.headers as Record<string, string>)['X-Is-Cacheable'] = 'true';
      (extendOption.headers as Record<string, string>)['Cache-Control'] = 'max-age=604800';
    } else {
      extendOption.headers = {
        'X-Is-Cacheable': 'true',
        'Cache-Control': 'max-age=604800'
      };
    }
  }
  // console.log({ headers: extendOption.headers, extendOption });

  const _ax = ax || axios;

  return _ax
    .request({
      url,
      method,
      // paramsSerializer: (params) => {
      //   return qs.stringify(params, { encodeValuesOnly: true });
      // },
      paramsSerializer: {
        // https://github.com/axios/axios/issues/5058#issuecomment-1272107602
        // encode: (params) => {
        //   console.log(qs.stringify(params, { encodeValuesOnly: true }), params);
        //   return qs.stringify(params, { encodeValuesOnly: true });
        // },
        indexes: null
      },
      ...params,
      ...extendOption
      // withCredentials: true,
    })
    .then((response): responseType => {
      const { config, data, headers } = response;
      const { responseSetting } = (config as responseConfigType) || {};

      let params = config.params;
      const configData = config.data;
      if (typeof configData === 'string') {
        try {
          params = JSON.parse(configData);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          params = configData;
        }
      } else if (configData) {
        params = configData;
      }
      CancelRequest.removeRequestCanceler(config.method, config.url, params);

      if (responseSetting?.returnRawResponse === true) {
        return response;
      }

      if (responseSetting?.returnHeaders === true) {
        data.responseHeaders = headers;
      }

      return data;
    })
    .catch(async (error) => {
      if (
        hasErrorAdapter === true &&
        typeof request.errorAdapter === 'function'
      ) {
        try {
          const headers = extendOption?.headers;
          const response = await request.errorAdapter(
            error,
            (newHeaders: Record<string, unknown>) =>
              request(
                _method,
                url,
                _params,
                { ...extendOption, headers: { ...(headers as object), ...newHeaders } },
                false
              )
          );
          if (typeof response === 'object' && response !== null) {
            return response;
          }
        } catch (error) {
          console.error('errorAdapter', error);
        }
      }
      const errorStatus = error?.response?.status;
      if (typeof error?.response !== 'object' || error?.response === null) {
        if (errorStatus === undefined) {
          error.response = {
            status: 500
          };
        } else {
          error.response.status = 500;
        }
      }
      if (typeof window === 'undefined') {
        console.log('\x1b[31m%s\x1b[0m ', error);
      } else {
        try {
          console.log(`%c${JSON.stringify(error)}`, 'color:red');
        } catch (_e) {
          console.log(`%c${error}`, 'color:red');
        }
      }
      throw error;
    });
};

request.get = function (...arg: requestArg): Promise<unknown> {
  return request('GET', ...arg);
};
request.post = function (...arg: requestArg): Promise<unknown> {
  return request('POST', ...arg);
};
request.put = function (...arg: requestArg): Promise<unknown> {
  return request('PUT', ...arg);
};
request.delete = function (...arg: requestArg): Promise<unknown> {
  return request('DELETE', ...arg);
};
request.patch = function (...arg: requestArg): Promise<unknown> {
  return request('PATCH', ...arg);
};
request.cancel = CancelRequest.handlerCancel;
request.getCancel = function (...arg: cancelArg): void {
  return CancelRequest.handlerCancel('get', ...arg);
};
request.postCancel = function (...arg: cancelArg): void {
  return CancelRequest.handlerCancel('post', ...arg);
};
request.putCancel = function (...arg: cancelArg): void {
  return CancelRequest.handlerCancel('put', ...arg);
};
request.deleteCancel = function (...arg: cancelArg): void {
  return CancelRequest.handlerCancel('delete', ...arg);
};
request.patchCancel = function (...arg: cancelArg): void {
  return CancelRequest.handlerCancel('patch', ...arg);
};
request.cancelAll = CancelRequest.handlerCancelAll;

if (HAS_INIT === true && typeof API_BASE === 'string' && API_BASE !== '') {
  axiosInit(API_BASE);
}

export default axiosInit;
