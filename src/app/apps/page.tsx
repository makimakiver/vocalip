// app/apps/page.tsx
import React from 'react';

interface AppCard {
  title: string;
  image: string;
  description: string;
  link?: string;
}

const apps: AppCard[] = [
  {
    title: 'Reel Video Creator',
    image: '/BrainRIP.png',
    description:
      'Create reels with voices on this platform and profits will be shared with you and the creator of the voice.',
    link: '/brain-rot',
  },
];

export default function AppListPage() {
  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh'
      }}
    >
      <h1
        style={{
          alignItems: 'center',
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: 'white',

        }}
      >
        dApps
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {apps.map((app) => (
          <div
            key={app.title}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2
                style={{
                  textAlign: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: '#1a202c',
                }}
              >
                {app.title}
              </h2>
              <img src={app.image} alt={app.title} style={{ width: '70%', height: 'auto', borderRadius: '8px', alignSelf: 'center' }} />
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  color: '#4a5568',
                }}
              >
                {app.description}
              </p>
            </div>

            {app.link && (
              <a
                href={app.link}
                style={{
                  textAlign: 'center',
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#3182ce',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Go to app
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
