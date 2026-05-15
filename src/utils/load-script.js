export function loadScript(id, src) {
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