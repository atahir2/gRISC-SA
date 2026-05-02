/** @type {import('next').NextConfig} */

const resolvedBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : process.env.NODE_ENV === "production"
      ? "/grisc-sa"
      : "";

const nextConfig = {
  /** Self-contained output for Docker / Node hosting (`node .next/standalone/server.js`). */
  output: "standalone",

  /**
   * Production is served at https://host/grisc-sa/ — Next must use this prefix on all
   * redirects and client navigations. Without it, /saq is sent to https://host/saq (404).
   *
   * Reverse proxy must forward the FULL URI to Node (e.g. /grisc-sa/saq), not strip /grisc-sa.
   * See scripts/nginx-subpath.example.conf
   *
   * Override: NEXT_PUBLIC_BASE_PATH=  (empty) at build time if deploy at site root.
   */
  basePath: resolvedBasePath,

  // Expose base path to the client so auth redirects (e.g. emailRedirectTo) can use
  // origin + basePath. window.location.origin alone omits /grisc-sa and breaks Supabase links.
  env: {
    NEXT_PUBLIC_BASE_PATH: resolvedBasePath,
  },

  // /grisc-sa/ → /grisc-sa/saq when traffic hits Next (nginx should also redirect bare /grisc-sa).
  async redirects() {
    return [
      {
        source: "/",
        destination: "/saq",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
