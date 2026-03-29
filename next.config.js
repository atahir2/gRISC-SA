/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Subpath hosting (e.g. https://host/grisc-sa/):
   *
   * - If your reverse proxy forwards the FULL path to Node (URI still starts with /grisc-sa),
   *   set at build time: NEXT_PUBLIC_BASE_PATH=/grisc-sa
   *
   * - If your proxy STRIPS /grisc-sa and Node only sees /, /saq, … (common) — leave basePath
   *   empty and configure nginx so /grisc-sa/* is rewritten to /* AND /_next/* is proxied.
   *   See scripts/nginx-subpath.example.conf
   */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

module.exports = nextConfig;
