import { googleGtagInit } from "@src/utils/third-party/gtag";

export function googleGTMInit(
  googleGTMID: string = "",
  log: boolean = false,
  callback?: (
    gtag: (...args: unknown[]) => void,
    gtm: (trackData?: Record<string, unknown>) => void,
    ...arg: unknown[]
  ) => void
): void {

  if (typeof googleGTMID !== "string" || googleGTMID === "") {
    console.error("缺少google gtm id");
    return;
  } else if (typeof document !== "object" || document === null) {
    console.error("document API遺失");
    return;
  }
  const src = `https://www.googletagmanager.com/gtm.js?id=${googleGTMID}&l=dataLayer`;

  function init(
    gtag: (...args: unknown[]) => void,
    gtm: (trackData?: Record<string, unknown>) => void,
    ...arg: unknown[]
  ) {
    if (typeof gtm === "function") {
      gtm({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    }
    if (typeof callback === "function") {
      callback(gtag, gtm, ...arg);
    }
  }
  googleGtagInit(log, init);

  const gtmScript = document.createElement("script");

  gtmScript.id = "gtmScript";
  gtmScript.setAttribute("id", "gtmScript");
  gtmScript.async = true;
  gtmScript.setAttribute("async", "true");
  gtmScript.src = src;
  gtmScript.setAttribute("src", src);

  document.querySelector("head")?.append(gtmScript);
}

export default googleGTMInit;
