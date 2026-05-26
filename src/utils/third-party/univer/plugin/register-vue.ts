import type { FUniver, Univer, IDocumentData } from '@univerjs/presets';
import { UniverVue3AdapterPlugin } from '@univerjs/ui-adapter-vue3';

import DownloadIcon from '@src/components/Icon/Download';

export function importRegisterVue(univerInstance: {
  univer: Univer;
  univerAPI: FUniver;
}) {
  if (typeof univerInstance !== 'object' || univerInstance === null) {
    throw new Error('[importRegisterVue] univerInstance is not an object');
  }

  const { univer, univerAPI } = univerInstance;
  console.log('registerPlugin UniverVue3AdapterPlugin');
  univer.registerPlugin(UniverVue3AdapterPlugin);
  console.log('registerPlugin UniverVue3AdapterPlugin success');

  console.log('registerComponent DownloadIcon');
  univerAPI.registerComponent('DownloadIcon', DownloadIcon, {
    framework: 'vue3'
  });
  console.log('registerComponent DownloadIcon success');
  // window.DownloadIcon = DownloadIcon;

  return { univer, univerAPI };
}
