// app/layout.tsx
import '@tomo-inc/tomo-evm-kit/styles.css';
import './globals.css'
import { ReactNode } from 'react'
import ClientProviders from './ClientProviders'
import Topbar from './components/Topbar'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ← providers must wrap everything that uses ConnectButton */}
        <ClientProviders>
          <Topbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

