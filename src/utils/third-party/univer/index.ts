import type { FUniver, Univer } from '@univerjs/presets'
export type { IDisposable } from '@univerjs/core';

export type univerInstance = {
    univer: Univer;
    univerAPI: FUniver;

}
export type univerInstanceRef = {
    univer: Univer | null;
    univerAPI: FUniver | null;
}

export * from './create-sheet';
export * from './create-doc';