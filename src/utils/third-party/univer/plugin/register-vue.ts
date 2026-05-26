import type { FUniver, Univer } from '@univerjs/presets';
import { UniverVue3AdapterPlugin } from '@univerjs/ui-adapter-vue3';

export function importRegisterVue(univerInstance: {
  univer: Univer;
  univerAPI: FUniver;
}) {
  if (typeof univerInstance !== 'object' || univerInstance === null) {
    throw new Error('[importRegisterVue] univerInstance is not an object');
  }

  const { univer, univerAPI, ...others } = univerInstance;
  univer.registerPlugin(UniverVue3AdapterPlugin);

  return { univer, univerAPI, ...others };
}
