import type { NextConfig } from "next";
import path from "path";
import os from "os";

const nextConfig: NextConfig = {
  transpilePackages: ['@tomo-inc/tomo-evm-kit', '@tomo-wallet/uikit-lite', '@tomo-inc/shared-type'],
  webpack(config, { isServer }) {
    // 1) Ignore all `.d.ts` files so they never hit the parser:
    config.cache = {
      type: 'filesystem',
      cacheDirectory: path.join(os.tmpdir(), 'webpack-cache'),
    };

    // 2) Make sure TS/TSX modules are resolvable
    config.resolve.extensions.push('.ts', '.tsx');

    return config;
  },
};

export default nextConfig;
