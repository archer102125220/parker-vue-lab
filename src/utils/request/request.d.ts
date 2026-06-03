import type { InternalAxiosRequestConfig } from 'axios';

export type getRequestKey = (
  method: string,
  url: string | undefined,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
) => string;
export type addRequestCanceler = (
  cancel: AbortController,
  method: string | undefined,
  url: string | undefined,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
) => void;
export type getRequestCanceler = (
  method: string,
  url: string,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
) => AbortController | null;
export type removeRequestCanceler = (
  method: string | undefined,
  url: string | undefined,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
) => void;
// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type handlerCancel = (method: string, url: string, params: any) => void;
export type handlerCancelAll = () => void;
export type requestCanceler = AbortController | null;

export type requestType = (
  _method: string,
  url: string,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _params: any,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _extendOption: any,
  errorAdapter: boolean
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type requestArg = [string, any?, any?, any?];
// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type cancelArg = [string, any];
// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type errorAdapterType = (error: any, headers?: any) => any;

// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type expandReques = (...arg: requestArg) => Promise<any>;
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
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultExtendOption?: { [key: string]: any };

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
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any;
}

export type generateReqKey = (config: config) => string | undefined;

export interface options {
  enabledByDefault: boolean;
  cacheFlag: string;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  getCache: Function;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  setCache: Function;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  deleteCache: Function;
}

export interface config extends InternalAxiosRequestConfig {
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  forceUpdate?: boolean;
  // method: string;
  // url: string;
  ttlConfig?: { [key: string]: string | undefined };
}

export type requestKey = string | undefined;
