import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      { protocol: "https", hostname: "static.wikia.nocookie.net" },
      { protocol: "https", hostname: "www.cia.gov" },
      { protocol: "https", hostname: "www.hisutton.com" }
    ]
  }
};

export default nextConfig;
