import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  canonicalPath?: string;
}

const SITE_NAME = "ToyPetMe";
const BASE_URL = "https://toypetme.replit.app";

export function usePageMeta({ title, description, canonicalPath }: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const setMeta = (selector: string, value: string, attr = "content") => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const attrName = selector.includes("property=") ? "property" : "name";
        const attrVal = selector.match(/["']([^"']+)["']/)?.[1] ?? "";
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    if (canonicalPath) {
      setMeta('meta[property="og:url"]', `${BASE_URL}${canonicalPath}`);
      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = `${BASE_URL}${canonicalPath}`;
    }
  }, [title, description, canonicalPath]);
}
