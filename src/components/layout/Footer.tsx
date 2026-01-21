'use client';

import Link from 'next/link';
import type { FooterContent } from '@/lib/contentstack';
import styles from './Footer.module.css';

interface FooterProps {
  content: FooterContent;
}

export function Footer({ content }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const copyrightText = (content.copyright_text || '© {year} ImpactConnect. All rights reserved.')
    .replace('{year}', currentYear.toString());

  return (
    <footer className={styles.footer}>
      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              {content.site_name || 'ImpactConnect'}
            </Link>
            {content.tagline && (
              <p className={styles.tagline}>{content.tagline}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <p className={styles.copyright}>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
