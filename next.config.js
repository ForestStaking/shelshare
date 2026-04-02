/** @type {import('next').NextConfig} */
const nextConfig = {
  // Shelby SDK may need server-side Node.js APIs not available in Edge runtime
  experimental: {
    serverComponentsExternalPackages: ['@shelby-protocol/sdk', '@aptos-labs/ts-sdk'],
  },
  // Wallet adapter packages use ESM and must be transpiled by Next.js
  transpilePackages: [
    '@aptos-labs/wallet-adapter-react',
    '@aptos-labs/wallet-adapter-core',
  ],
};

module.exports = nextConfig;
