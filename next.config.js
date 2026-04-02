/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep Shelby and Aptos SDKs as external — resolved from node_modules at runtime
    serverComponentsExternalPackages: ['@shelby-protocol/sdk', '@aptos-labs/ts-sdk'],
    // Explicitly include the clay.wasm binary used by the Shelby SDK.
    // Vercel's file tracer doesn't auto-detect .wasm files inside node_modules.
    outputFileTracingIncludes: {
      '/api/upload': ['./node_modules/@shelby-protocol/clay-codes/dist/**'],
      '/api/download/[shortId]': ['./node_modules/@shelby-protocol/clay-codes/dist/**'],
    },
  },
  // Wallet adapter packages use ESM and must be transpiled by Next.js
  transpilePackages: [
    '@aptos-labs/wallet-adapter-react',
    '@aptos-labs/wallet-adapter-core',
  ],
};

module.exports = nextConfig;
