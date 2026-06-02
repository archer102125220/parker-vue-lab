import {
  transformSnapshotJsonToWorkbookData,
  transformSnapshotJsonToDocumentData
} from '@univerjs-pro/exchange-client';
import {
  UniverInstanceType,
  type IWorkbookData,
  type IDocumentData
} from '@univerjs/core';

/**
 * 從遠端伺服器拉取 Univer Snapshot 並轉譯為本機可用格式
 * @param unitId 文件或試算表的 ID
 * @param type UniverInstanceType (UNIVER_DOC 或是 UNIVER_SHEET)
 * @returns 轉譯後的資料，符合 Univer 嚴格模式所預期的 Partial 格式
 */
export async function fetchUniverSnapshot(
  unitId: string,
  type: UniverInstanceType.UNIVER_DOC
): Promise<Partial<IDocumentData>>;
export async function fetchUniverSnapshot(
  unitId: string,
  type: UniverInstanceType.UNIVER_SHEET
): Promise<Partial<IWorkbookData>>;
export async function fetchUniverSnapshot(
  unitId: string,
  type: UniverInstanceType.UNIVER_DOC | UniverInstanceType.UNIVER_SHEET
): Promise<Partial<IDocumentData> | Partial<IWorkbookData>> {
  const host = import.meta.env.VITE_UNIVERSER_PROXY_PATH ?? '';
  const res = await fetch(
    `${host}/universer-api/snapshot/${type}/unit/${unitId}/rev/0`
  );
  const data = await res.json();

  if (!data || !data.snapshot) {
    throw new Error('Invalid snapshot data: Missing snapshot block');
  }

  if (type === UniverInstanceType.UNIVER_DOC) {
    if (!data.snapshot.doc) {
      throw new Error('Invalid snapshot data: Missing doc data');
    }
    const snapshot = transformSnapshotJsonToDocumentData(data);
    return snapshot as unknown as Partial<IDocumentData>;
  }

  if (type === UniverInstanceType.UNIVER_SHEET) {
    if (!data.snapshot.workbook) {
      throw new Error('Invalid snapshot data: Missing workbook data');
    }
    const snapshot = transformSnapshotJsonToWorkbookData(data);
    return snapshot as unknown as Partial<IWorkbookData>;
  }

  throw new Error('Unsupported snapshot type');
}
