export function loadCSS(
  id: string,
  href: string,
  attributes: Record<string, unknown> = {},
  successDelay = 0
): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (document.getElementById(id) !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;

    Object.keys(attributes).forEach((key) => {
      if (['load', 'error', 'onload', 'onerror'].includes(key)) return;
      link.setAttribute(key, attributes[key] as string);
    });

    const loadEvent = attributes.load || attributes.onload;
    const errorEvent = attributes.error || attributes.onerror;

    link.onload = (...args) => {
      if (typeof loadEvent === 'function') {
        loadEvent(...args);
      }
      if (successDelay > 0) {
        setTimeout(resolve, successDelay);
      } else {
        resolve();
      }
    };
    link.onerror = (...args) => {
      if (typeof errorEvent === 'function') {
        errorEvent(...args);
      }
      reject();
    };
    document.head.appendChild(link);
  });
}

export default loadCSS;
