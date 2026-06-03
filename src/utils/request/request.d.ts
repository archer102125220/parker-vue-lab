import type { InternalAxiosRequestConfig } from 'axios';

export type getRequestKey = (
  method: string,
  url: string | undefined,
  params: unknown
) => string;
export type addRequestCanceler = (
  cancel: AbortController,
  method: string | undefined,
  url: string | undefined,
  params: unknown
) => void;
export type getRequestCanceler = (
  method: string,
  url: string,
  params: unknown
) => AbortController | null;
export type removeRequestCanceler = (
  method: string | undefined,
  url: string | undefined,
  params: unknown
) => void;
export type handlerCancel = (method: string, url: string, params: unknown) => void;
export type handlerCancelAll = () => void;
export type requestCanceler = AbortController | null;

export type requestType = (
  _method: string,
  url: string,
  _params: Record<string, unknown> | undefined,
  _extendOption: Record<string, unknown> | undefined,
  errorAdapter: boolean | undefined
) => Promise<unknown>;

export type requestArg = [string, Record<string, unknown>?, Record<string, unknown>?, boolean?];
export type cancelArg = [string, unknown];
export type errorAdapterType = (error: unknown, getRequestWithNewHeaders?: (newHeaders: Record<string, unknown>) => Promise<unknown>) => unknown;

export type expandReques = (...arg: requestArg) => Promise<unknown>;
export type expandCancel = (...arg: cancelArg) => void;

export interface requestCancelerList {
  [key: string]: requestCanceler;
}
export interface cancelRequestInterface {
  requestCancelerList: requestCancelerList;
  getRequestKey: getRequestKey;
  addRequestCanceler: addRequestCanceler;
  getRequestCanceler: getRequestCanceler;
  removeRequestCanceler: removeRequestCanceler;
  handlerCancel: handlerCancel;
  handlerCancelAll: handlerCancelAll;
}

export interface requestInterface extends requestType {
  ax?: AxiosInstance;
  axios?: typeof axios;
  baseURL?: string;
  errorAdapter?: errorAdapterType | boolean;
  defaultExtendOption?: Record<string, unknown>;

  get: expandReques;
  post: expandReques;
  put: expandReques;
  delete: expandReques;
  patch: expandReques;
  cancel: cancelRequestInterface['handlerCancel'];
  getCancel: expandCancel;
  postCancel: expandCancel;
  putCancel: expandCancel;
  deleteCancel: expandCancel;
  patchCancel: expandCancel;
  cancelAll: cancelRequestInterface['handlerCancelAll'];
}
export interface requestParams {
  data?: unknown;
  params?: unknown;
}

export type generateReqKey = (config: config) => string | undefined;

export interface options {
  enabledByDefault: boolean;
  cacheFlag: string;
  getCache: (requestKey: string | undefined, config?: Record<string, unknown>) => unknown;
  setCache: (requestKey: string | undefined, response: unknown, config?: Record<string, unknown>) => void;
  deleteCache: (requestKey: string | undefined, config?: Record<string, unknown>) => void;
}

export interface config extends InternalAxiosRequestConfig {
  [key: string]: unknown;
  forceUpdate?: boolean;
  // method: string;
  // url: string;
  ttlConfig?: { [key: string]: string | undefined };
}

export type requestKey = string | undefined;
