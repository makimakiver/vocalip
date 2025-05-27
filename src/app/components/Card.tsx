// app/components/Card.tsx
'use client';
import React from 'react';

type CardProps = {
  name: string;
  imageSrc: string;
  description: string;
};

export type Voice = {
    name: string;
    imageSrc: string;
    description: string;
  };
  
export default function Card({ name, imageSrc, description }: CardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid #eaeaea',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '220px',
        textAlign: 'center',
      }}
    >
      <img
        src={imageSrc}
        alt={`${name} avatar`}
        width={80}
        height={80}
        style={{ borderRadius: '50%', marginBottom: '0.5rem' }}
      />
      <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.25rem', color: '#333' }}>
        {name}
      </h3>
      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
        {description}
      </p>
    </div>
  );
}
