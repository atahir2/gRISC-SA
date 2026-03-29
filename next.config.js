/** @type {import('next').NextConfig} */
const nextConfig = {
  // URL path prefix when the app is served under a subpath (e.g. https://host/grisc-sa/).
  // Must start with "/" — never use filesystem paths like "~/grisc-sa" (breaks assets → blank page).
  basePath: process.env.NODE_ENV === "production" ? "/grisc-sa" : "",
};

module.exports = nextConfig;
