export function getCookie(cname: string, cookie: string): string {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c: string = ca[i] ?? '';
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
export function getJsonCookie<T = Record<string, unknown>>(
  cookieString: string
): T {
  const cookie: Record<string, unknown> = {};
  const decodedCookie = decodeURIComponent(cookieString);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const safeCa = ca[i] ?? '';
    const c = safeCa.split('=');
    if (Array.isArray(c) === false || c.length <= 0) {
      continue;
    }

    const [key, value] = c;
    if (typeof key !== 'string') {
      continue;
    }

    cookie[key] = value ?? null;
  }
  return cookie as T;
}

export function asciiToText(text: string): string {
  const strings = text.split('\\');
  const result = strings.reduce((result, string, index) => {
    let t = string;
    if (index !== 0) t = String.fromCharCode(parseInt(string, 8));
    return result.concat(t);
  }, '');
  return result;
}
