/**
 * URLs for files in `public/`. Required when Next.js `basePath` is set and for
 * `<Image unoptimized />` / `<img>` — basePath may not always be injected in SSR output.
 */
export function assetUrl(pathFromPublicRoot: string): string {
  const path = pathFromPublicRoot.startsWith("/")
    ? pathFromPublicRoot
    : `/${pathFromPublicRoot}`;
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/+$/, "");
  return base === "" ? path : `${base}${path}`;
}
