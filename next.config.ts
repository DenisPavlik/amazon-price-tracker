import type { NextConfig } from "next";

// Node.js v25 exposes a broken global `localStorage`/`sessionStorage` on the server
// (without `--localstorage-file=<path>` the methods throw "is not a function").
// Libraries like next-themes guard with `typeof window === 'undefined'` only, so they
// assume that means storage is also unavailable. Strip these globals on the server
// to restore the expected "Node has no Web Storage" contract.
if (typeof window === "undefined") {
  const g = globalThis as Record<string, unknown>;
  if (typeof g.localStorage !== "undefined") delete g.localStorage;
  if (typeof g.sessionStorage !== "undefined") delete g.sessionStorage;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
    ],
  },
};

export default nextConfig;
