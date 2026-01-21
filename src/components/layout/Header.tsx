'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { parseNavLinks } from '@/lib/contentstack';
import type { NavbarContent } from '@/lib/contentstack';
import styles from './Header.module.css';

interface HeaderProps {
  content: NavbarContent;
}

export function Header({ content }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          {content.logo_url ? (
            <Image
              src={content.logo_url}
              alt={content.site_name}
              width={140}
              height={32}
              className={styles.logoImage}
            />
          ) : (
            content.site_name
          )}
        </Link>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileMenuOpen ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </>
            )}
          </svg>
        </button>

        <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksOpen : ''}`}>
          {/* Dynamic Nav Links (excluding FAQ - FAQ appears at the end) */}
          {parseNavLinks(content.nav_links_json)
            .filter(link => link.url !== '/faq')
            .map((link, index) => (
              <Link
                key={index}
                href={link.url}
                className={`${styles.navLink} ${isActive(link.url) ? styles.navLinkActive : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                target={link.new_tab ? '_blank' : undefined}
                rel={link.new_tab ? 'noopener noreferrer' : undefined}
              >
                {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
                {link.label}
              </Link>
            ))}

          {/* User Menu Links */}
          {content.show_user_menu !== false && (
            <>
              <Link
                href="/my-registrations"
                className={`${styles.navLink} ${isActive('/my-registrations') ? styles.navLinkActive : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {content.my_registrations_label || 'My Registrations'}
              </Link>

              <Link
                href="/my-events"
                className={`${styles.navLink} ${isActive('/my-events') ? styles.navLinkActive : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {content.my_events_label || 'My Events'}
              </Link>
            </>
          )}

          {/* FAQ Link (at the end) */}
          {parseNavLinks(content.nav_links_json)
            .filter(link => link.url === '/faq')
            .map((link, index) => (
              <Link
                key={`faq-${index}`}
                href={link.url}
                className={`${styles.navLink} ${isActive(link.url) ? styles.navLinkActive : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                target={link.new_tab ? '_blank' : undefined}
                rel={link.new_tab ? 'noopener noreferrer' : undefined}
              >
                {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
                {link.label}
              </Link>
            ))}

          {/* CTA Button */}
          {content.show_cta !== false && (
            <Link 
              href={content.cta_url || '/create-event'} 
              className={styles.createButton}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className={styles.createIcon}>+</span>
              <span>{content.cta_text || 'Create Event'}</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
