// app/components/Topbar.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import { ConnectButton } from '@tomo-inc/tomo-evm-kit'

export default function Topbar() {
  const links = [
    { label: 'Home', href: '/' },
    { label: 'Record', href: '/record' },
    { label: 'My Voices', href: '/my-voices' },
    { label: 'About', href: 'https://spiny-elderberry-76f.notion.site/Voice-as-an-IP-assets-1fd1ff50043d8013bdeec147323122a9?pvs=74' },
    { label: 'Apps', href: '/apps' },
  ]

  return (
    <header
      style={{
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 1rem',
      }}
    >
      {/* Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '40px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/logo_black.png"
            alt="logo"
            width={60}
            height={60}
            style={{ borderRadius: '50%' }}
          />
          <span
            style={{
              marginLeft: '0.5rem',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Vocalip
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav>
        <ul
          style={{
            display: 'flex',
            gap: '1rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {links.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  padding: '0.25rem 0.5rem',
                }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Wallet Connect */}
      <ConnectButton />
    </header>
  )
}
