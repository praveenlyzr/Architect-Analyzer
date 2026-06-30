/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow CoinGecko/Architect-hosted coin logos etc. shown inside fetched apps.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
