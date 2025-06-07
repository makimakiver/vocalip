// app/page.tsx
'use client';

import React from 'react';
import Topbar from './components/Topbar';
import Link from 'next/link';
import FloatingCardsBackground from './components/FloatingCardsBackground';

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'sans-serif', margin: 0, padding: 0, minHeight: '100vh' }}>
      <FloatingCardsBackground />
      <main style={{ padding: '2rem 1rem', maxWidth: 800, margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{ background: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)', padding: '2rem', borderRadius: '10px' }}>
          <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              Voice IP Marketplace
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#555', marginBottom: '2rem' }}>
              Register your unique voice as an NFT, license it for commercial use, and earn revenue automatically.
            </p>
          </section>

          {/* Features Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ fontSize: '1.5rem' }}>🎤</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>1. Record & Upload</h2>
                <p style={{ margin: 0, color: '#666' }}>
                  Capture your voice in-browser or upload an existing file and store it on IPFS.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ fontSize: '1.5rem' }}>🖼️</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>2. Mint Your Voice NFT</h2>
                <p style={{ margin: 0, color: '#666' }}>
                  Mint an ERC-721 token with your voice metadata and IPFS URI.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ fontSize: '1.5rem' }}>📂</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>3. Manage Your Voices</h2>
                <p style={{ margin: 0, color: '#666' }}>
                  View all your minted voice assets on the “My Voices” page.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ fontSize: '1.5rem' }}>💰</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>4. Revenue Attribution</h2>
                <p style={{ margin: 0, color: '#666' }}>
                  Automatically split and receive earnings whenever your voice is licensed.
                </p>
              </div>
            </div>
          </section>
          <section style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="/record">
              <button
                style={{
                  backgroundColor: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Register Voice!!
              </button>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
