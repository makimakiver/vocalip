import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@tomo-inc/tomo-evm-kit', '@tomo-wallet/uikit-lite', '@tomo-inc/shared-type'],
  webpack(config, { isServer }) {
    // 1) Ignore all `.d.ts` files so they never hit the parser:
    config.module.rules.push({
      test: /\.d\.ts$/,
      use: 'ignore-loader',
    });

    if (isServer) {
      // 2) Don’t bundle these server-only Remotion modules; load them at runtime instead
      config.externals = [
        ...config.externals,
        '@remotion/bundler',
        '@remotion/renderer',
        '@remotion/babel-loader',
      ];
    }

    return config;
  },
};

export default nextConfig;
