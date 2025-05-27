// app/components/FloatingCardsBackground.tsx
'use client';
import React, { useMemo } from 'react';
import styles from './FloatingCardsBackground.module.css';
import Card, { Voice } from './Card';

type CardData = {
  id: number;
  duration: number;   // in seconds
  delay: number;      // in seconds
  top: number;        // in % of viewport height
  startX: number;     // in px (negative)
  endX: number;       // in vw (positive beyond 100)
  rotateStart: number;// in deg
  rotateEnd: number;  // in deg
};

const voices: Voice[] = [
    {
      name: 'Alice',
      imageSrc: '/voices/alice.png',
      description: 'A warm, friendly voice perfect for narration and storytelling.',
    },
    {
      name: 'Bob',
      imageSrc: '/voices/bob.png',
      description: 'A deep, authoritative tone ideal for commercials and promos.',
    },
    {
      name: 'Carla',
      imageSrc: '/voices/carla.png',
      description: 'Bright and energetic—great for upbeat advertisements.',
    },
    {
      name: 'Dante',
      imageSrc: '/voices/dante.png',
      description: 'Smooth, laid-back style—perfect for podcasts and interviews.',
    },
    {
      name: 'Eve',
      imageSrc: '/voices/eve.png',
      description: 'Soft and soothing whisper—ideal for ASMR and meditation.',
    },
    {
      name: 'Frank',
      imageSrc: '/voices/frank.png',
      description: 'Neutral and clear—suited for e-learning and IVR systems.',
    },
    {
      name: 'Grace',
      imageSrc: '/voices/grace.png',
      description: 'Warm yet professional—great for corporate videos.',
    },
    {
      name: 'Heidi',
      imageSrc: '/voices/heidi.png',
      description: 'Playful and youthful—perfect for kids’ content.',
    },
    {
      name: 'Ivan',
      imageSrc: '/voices/ivan.png',
      description: 'Gravelly and rugged—ideal for trailers and action promos.',
    },
    {
      name: 'Judy',
      imageSrc: '/voices/judy.png',
      description: 'Bright and articulate—fits well in educational apps.',
    },
    {
      name: 'Mallory',
      imageSrc: '/voices/mallory.png',
      description: 'Mellow and calm—great for background narration.',
    },
    {
      name: 'Nate',
      imageSrc: '/voices/nate.png',
      description: 'Energetic and motivational—perfect for fitness content.',
    },
  ];

const NUM_CARDS = voices.length;

function generateCards(count: number): CardData[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    duration: 15 + Math.random() * 10,    // 15–25s
    delay: Math.random() * 8,             // 0–8s
    top: 5 + Math.random() * 90,          // avoid top/bottom edges
    startX: -(50 + Math.random() * 200),  // −50px to −250px
    endX: 100 + Math.random() * 100,      // 100vw to 200vw
    rotateStart: Math.random() * 360,     // 0–360°
    rotateEnd: Math.random() * 360,       // 0–360°
  }));
}

export default function FloatingCardsBackground() {
  const cards = useMemo(() => generateCards(NUM_CARDS), []);

  return (
    <div className={styles.container}>
      {cards.map(({ id, duration, delay, top, startX, endX, rotateStart, rotateEnd }) => {
        const { name, imageSrc, description } = voices[id];
        return (
          <div
            key={id}
            className={styles.card}
            style={{
              top: `${top}%`,
              // set all of our random values as CSS vars:
              '--start-x': `${startX}px`,
              '--end-x': `${endX}vw`,
              '--rotate-start': `${rotateStart}deg`,
              '--rotate-end': `${rotateEnd}deg`,
              '--anim-duration': `${duration}s`,
              '--anim-delay': `${delay}s`,
            } as React.CSSProperties}
          >
            <Card name={name} imageSrc={imageSrc} description={description} />
          </div>
        );
      })}
    </div>
  );
}
