/**
 * Cause Cards Section
 * Displays cause cards with scroll-triggered animations
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Cause } from '@/types';
import styles from '@/app/landing.module.css';

interface CauseCardsSectionProps {
  title?: string;
  causes: Cause[];
  backgroundImage?: {
    url: string;
    title?: string;
  };
}

export function CauseCardsSection({ title, causes, backgroundImage }: CauseCardsSectionProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => new Set(prev).add(index));
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [causes]);

  return (
    <section
      className={styles.causes}
      style={backgroundImage?.url ? {
        backgroundImage: `url(${backgroundImage.url})`,
      } : undefined}
    >
      <h2 className={styles.sectionTitleBlack}>{title || 'Causes We Support'}</h2>
      <div className={styles.causeGrid}>
        {causes.slice(0, 4).map((cause, index) => (
          <Link
            key={cause.uid}
            ref={(el) => { cardsRef.current[index] = el; }}
            href={`/opportunities?causes=${cause.slug}`}
            className={`${styles.causeCard} ${visibleCards.has(index) ? styles.visible : ''}`}
            style={(cause.image?.url || cause.icon?.url) ? {
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(30, 41, 59, 0.75)), url(${cause.image?.url || cause.icon?.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            } : undefined}
          >
            <h3 className={styles.causeName}>{cause.name}</h3>
            <p className={styles.causeDesc}>{cause.description || ''}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
