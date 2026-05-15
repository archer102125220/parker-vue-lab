export function loadCSS(id: string, href: string): Promise<void> {
    if (typeof document === 'undefined') {
    throw new Error('document is not defined');
  }

  if (document.getElementById(id) !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

export default loadCSS;
