import _debounce from 'lodash/debounce';
import { ref, computed, getCurrentScope, onScopeDispose } from 'vue';

export const DEFAULT_WIDTH = 1920;
export const DEFAULT_HEIGHT = 1080;

export function useWindowSize() {
  const width = ref(
    typeof window !== 'undefined' ? window.innerWidth : DEFAULT_WIDTH
  );
  const height = ref(
    typeof window !== 'undefined' ? window.innerHeight : DEFAULT_HEIGHT
  );

  const windowSize = computed(() => ({
    width: width.value,
    height: height.value
  }));

  const handleResize = _debounce(() => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }, 200);

  if (typeof window !== 'undefined') {
    handleResize();
    window.addEventListener('resize', handleResize);
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      window.removeEventListener('resize', handleResize);
    });
  }

  return { width, height, windowSize };
}

export default useWindowSize;
