import type { FUniver, Univer, IDocumentData } from '@univerjs/presets';
import { LocaleType, type IDisposable } from '@univerjs/core';

export type { IDisposable, IDocumentData };

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
