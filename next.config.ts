import type { NextConfig } from "next";
import path from "path";
import os from "os";

const nextConfig: NextConfig = {
  transpilePackages: ['@tomo-inc/tomo-evm-kit', '@tomo-wallet/uikit-lite', '@tomo-inc/shared-type'],
  webpack(config, { isServer }) {
    // 0) Send .d.ts to ignore-loader before anything else
    config.module.rules.unshift({
      test: /\.d\.ts$/,
      use: 'ignore-loader',
    });
  
    // 1) Redirect caching into /tmp so Vercel’s Lambda can write it
    config.cache = {
      type: 'filesystem',
      cacheDirectory: path.join(os.tmpdir(), 'webpack-cache'),
    };
  
    // 2) Server-side externals for Remotion
    if (isServer) {
      config.externals = [
        ...config.externals,
        '@remotion/bundler',
        '@remotion/renderer',
        '@remotion/babel-loader',
      ];
    }
  
    return config;
  }
};

export default nextConfig;
