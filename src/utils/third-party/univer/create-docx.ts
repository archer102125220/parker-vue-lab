// import { importUniver } from '@src/utils/third-party/univer';

export async function importDocx() {
  return await Promise.all([
    import('@univerjs/presets'),
    import('@univerjs/preset-docs-core'),
    import('@univerjs/preset-docs-drawing'),
    import('@univerjs/preset-docs-advanced'),
  ]);
}

export default importDocx;