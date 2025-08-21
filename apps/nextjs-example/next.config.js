/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    // Enable experimental features if needed
  },
  transpilePackages: ["@govie-ds/react", "@govie-ds/theme-govie"],
}

module.exports = nextConfig
