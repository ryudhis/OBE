/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"], // Add more domains if needed
  },
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.map$/,
      use: "ignore-loader",
    });
    return config; // Important: return the config object!
  },
};

export default nextConfig;
