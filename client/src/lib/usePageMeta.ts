import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
}

const SITE_NAME = "ToyPetMe";
const BASE_URL = "https://toypetme.replit.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export function usePageMeta({ title, description, canonicalPath, ogImage }: PageMetaOptions) {
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

    const imageUrl = ogImage ?? DEFAULT_OG_IMAGE;

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', imageUrl);
    setMeta('meta[property="og:image:width"]', "1200");
    setMeta('meta[property="og:image:height"]', "630");
    setMeta('meta[property="og:type"]', "website");
    setMeta('meta[name="twitter:card"]', "summary_large_image");
    setMeta('meta[name="twitter:image"]', imageUrl);
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', description);

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
  }, [title, description, canonicalPath, ogImage]);
}
