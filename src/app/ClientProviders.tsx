// app/ClientProviders.tsx
'use client';

import '@tomo-inc/tomo-evm-kit/styles.css';
import { ReactNode } from 'react';
import { ConnectButton, getDefaultConfig, TomoEVMKitProvider } from '@tomo-inc/tomo-evm-kit';
import { WagmiProvider } from 'wagmi';
import { storyAeneid } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = getDefaultConfig({
  clientId: 'dGcdGcTWIhBsesDXlzLjWLaJX9rQUbdhb1F1GcmXufOdSfqs9LhHucUUYz3ynCMOigfszcrGNX4qprZKbAb558hT',
  appName: 'My TomoEVMKit App',
  projectId: '8ab062a3d48237d7be721f18602cf066',
  chains: [storyAeneid],
  ssr: true,
});

const queryClient = new QueryClient();

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TomoEVMKitProvider>
          {children as any}
        </TomoEVMKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
