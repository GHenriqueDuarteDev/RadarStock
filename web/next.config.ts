import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const webDir = path.dirname(fileURLToPath(import.meta.url));
// Inclui `../contracts` (pacote local linkado) dentro da raiz do Turbopack.
const monorepoRoot = path.join(webDir, "..");

const nextConfig: NextConfig = {
  transpilePackages: ["@radarstock/contracts"],
  turbopack: {
    root: monorepoRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
