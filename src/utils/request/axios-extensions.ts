import qs from 'qs';
import type { AxiosAdapter } from 'axios';

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
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  defaultAdapter: Function,
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
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    try {
      return await defaultAdapter(config); // 使用預設的xhrAdapter發送請求
    } catch (error) {
      if (isLike === true) {
        deleteCache(requestKey, ttlConfig);
      }
      throw error;
    }
  }

  return async (config: config) => {
    const { method, forceUpdate, ttlConfig = {} } = config;
    const useCache: boolean =
      config[cacheFlag] !== undefined && config[cacheFlag] !== null
        ? config[cacheFlag]
        : enabledByDefault;
    const isLike: boolean = isCacheLike(getCache, setCache, deleteCache);
    const requestKey: requestKey =
      typeof generateReqKey === 'function'
        ? generateReqKey(config)
        : defaultGenerateReqKey(config); // 生成請求Key

    // TODO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let responsePromise: Promise<any> | null = null;
    if (useCache === true && isLike === true) {
      responsePromise =
        (await getCache(requestKey, { ...ttlConfig, method })) || null; // 從快取中取得請求key對應的響應對象
    }

    if (responsePromise === null || forceUpdate === true) {
      // 快取未命中/失效或強制更新時，則重新請求資料
      responsePromise = await handelDefaultAdapter(config, requestKey, isLike, {
        ...ttlConfig,
        method
      });

      if (isLike === true) {
        setCache(requestKey, responsePromise, { ...ttlConfig, method }); // 保存請求回傳的響應對象
      }
    }

    return responsePromise; // 回傳已經保存得響應對象
    // return defaultAdapter(config); // 使用預設的xhrAdapter發送請求
  };
}
export default cacheAdapterEnhancer;
