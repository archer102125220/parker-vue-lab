import type { FUniver, Univer, IDocumentData } from '@univerjs/presets';
import {
  LocaleType,
  UniverInstanceType,
  type IDisposable,
  type IWorkbookData,
  type DependencyOverride,
  type IUniverConfig,
  type Plugin,
  type PluginCtor
} from '@univerjs/core';

export interface IPreset {
  plugins: Array<
    | PluginCtor<Plugin>
    | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]
  >;
}
export interface IPresetOptions {
  lazy?: boolean;
}
// @univerjs/presets/lib/types/umd.d.ts 沒倒出的 createUniver 接收參數的型別
export type CreateUniverOptions = Partial<IUniverConfig> & {
  presets: Array<IPreset | [IPreset, IPresetOptions]>;
  plugins?: Array<
    | PluginCtor<Plugin>
    | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]
  >;
  override?: DependencyOverride;
  collaboration?: true;
};

export type {
  IDisposable,
  IDocumentData,
  IWorkbookData,
  DependencyOverride,
  IUniverConfig,
  Plugin,
  PluginCtor
};
export { UniverInstanceType };

export type univerInstance = {
  univer: Univer;
  univerAPI: FUniver;
  LocaleType: typeof LocaleType;
};
export type univerInstanceRef = {
  univer: Univer | null;
  univerAPI: FUniver | null;
  LocaleType: typeof LocaleType | null;
};

export * from './create-sheet';
export * from './create-doc';
export * from './snapshot';
