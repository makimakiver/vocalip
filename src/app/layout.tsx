// app/layout.tsx
import '@tomo-inc/tomo-evm-kit/styles.css';
import './globals.css'
import { ReactNode } from 'react'
import ClientProviders from './ClientProviders'
import Topbar from './components/Topbar'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: 'linear-gradient(135deg, #c3dafe 0%, #ffffff 50%, #fed7e2 100%)' }}>
        {/* ← providers must wrap everything that uses ConnectButton */}
        <ClientProviders>
          <Topbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

