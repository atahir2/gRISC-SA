/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: process.env.NODE_ENV === 'production' ? '/grisc-sa' : '',
};

module.exports = nextConfig;
