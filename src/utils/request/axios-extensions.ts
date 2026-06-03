import qs from 'qs';
import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

import type {
  config,
  options,
  generateReqKey,
  requestKey
} from '@src/utils/request/request.d.ts';

// https://juejin.cn/post/6974902702400602148

function defaultGenerateReqKey(config: config): string {
  const { method, url, params, data } = config;
  return [method, url, qs.stringify(params), qs.stringify(data)].join('&');
}

function isCacheLike(
  getCache: options['getCache'],
  setCache: options['setCache'],
  deleteCache: options['deleteCache']
): boolean {
  return (
    typeof getCache === 'function' &&
    typeof setCache === 'function' &&
    typeof deleteCache === 'function'
  );
}

export function cacheAdapterEnhancer(
  options: options,
  defaultAdapter: AxiosAdapter,
  generateReqKey?: generateReqKey
): AxiosAdapter {
  if (typeof defaultAdapter !== 'function') {
    throw new TypeError('default defaultAdapter is not function');
  }
  const {
    enabledByDefault = true,
    cacheFlag = 'cache',
    getCache,
    setCache,
    deleteCache
  } = options;

  async function handelDefaultAdapter(
    config: config,
    requestKey: requestKey,
    isLike: boolean,
    ttlConfig: config['ttlConfig']
  ): Promise<AxiosResponse<unknown>> {
    try {
      return await defaultAdapter(config as InternalAxiosRequestConfig); // 使用預設的xhrAdapter發送請求
    } catch (error) {
      if (isLike === true) {
        deleteCache(requestKey, ttlConfig);
      }
      throw error;
    }
  }

  return async (config: InternalAxiosRequestConfig) => {
    const _config = config as config;
    const { method, forceUpdate, ttlConfig = {} } = _config;
    const useCache: boolean =
      _config[cacheFlag] !== undefined && _config[cacheFlag] !== null
        ? _config[cacheFlag]
        : enabledByDefault;
    const isLike: boolean = isCacheLike(getCache, setCache, deleteCache);
    const requestKey: requestKey =
      typeof generateReqKey === 'function'
        ? generateReqKey(_config)
        : defaultGenerateReqKey(_config); // 生成請求Key

    let response: AxiosResponse<unknown> | null = null;
    if (useCache === true && isLike === true) {
      response = (await getCache(requestKey, { ...ttlConfig, method })) || null; // 從快取中取得請求key對應的響應對象
    }

    if (response === null || forceUpdate === true) {
      // 快取未命中/失效或強制更新時，則重新請求資料
      response = await handelDefaultAdapter(_config, requestKey, isLike, {
        ...ttlConfig,
        method
      });

      if (isLike === true) {
        setCache(requestKey, response, { ...ttlConfig, method }); // 保存請求回傳的響應對象
      }
    }

    return response!; // 回傳已經保存得響應對象
    // return defaultAdapter(_config as InternalAxiosRequestConfig); // 使用預設的xhrAdapter發送請求
  };
}
export default cacheAdapterEnhancer;
