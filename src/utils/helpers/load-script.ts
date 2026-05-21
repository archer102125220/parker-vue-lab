export function loadScript(
  id: string,
  src: string,
  attributes: Record<string, unknown> = {},
  successDelay = 500,
): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  if (document.getElementById(id) !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;

    Object.keys(attributes).forEach((key) => {
      script.setAttribute(key, attributes[key] as string);
    });

    const loadEvent = attributes.load;
    const errorEvent = attributes.error;

    script.onload = (...args) => {
      if (typeof loadEvent === "function") {
        loadEvent(...args);
      }

      if (successDelay > 0) {
        setTimeout(resolve, successDelay);
      } else {
        resolve();
      }
    };
    script.onerror = (...args) => {
      if (typeof errorEvent === "function") {
        errorEvent(...args);
      }
      reject();
    };
    document.head.appendChild(script);
  });
}

export default loadScript;
