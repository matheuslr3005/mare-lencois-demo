import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Alias explícito: o nome da pasta tem acentos e quebra a resolução automática de "@/".
  webpack: (config) => {
    config.resolve.alias["@"] = root;
    return config;
  },
};
export default nextConfig;
