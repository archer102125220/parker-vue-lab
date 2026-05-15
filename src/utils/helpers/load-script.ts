export function loadScript(id: string, src: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (document.getElementById(id) !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    // 完全不設定 async，讓瀏覽器依照插入順序執行
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default loadScript;
