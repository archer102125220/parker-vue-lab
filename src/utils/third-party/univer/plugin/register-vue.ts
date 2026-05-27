import type { FUniver, Univer } from '@univerjs/presets';
import { UniverVue3AdapterPlugin } from '@univerjs/ui-adapter-vue3';

import IconFolder from '@src/components/Icon/Folder.vue';
import IconCSV from '@src/components/Icon/CSV.vue';

export function importRegisterVue(univerInstance: {
  univer: Univer;
  univerAPI: FUniver;
}) {
  if (typeof univerInstance !== 'object' || univerInstance === null) {
    throw new Error('[importRegisterVue] univerInstance is not an object');
  }

  const { univer, univerAPI, ...others } = univerInstance;
  univer.registerPlugin(UniverVue3AdapterPlugin);
  univerAPI.registerComponent('Vue3FolderIcon', IconFolder, {
    framework: 'vue3'
  });
  univerAPI.registerComponent('Vue3CSVIcon', IconCSV, {
    framework: 'vue3'
  });

  return { univer, univerAPI, ...others };
}
