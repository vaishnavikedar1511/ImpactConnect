'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';
import type { FooterContent } from '@/lib/contentstack';

interface FooterWrapperProps {
  content: FooterContent;
}

// Pages where footer should NOT appear
const PAGES_WITHOUT_FOOTER = ['/', '/faq'];

export function FooterWrapper({ content }: FooterWrapperProps) {
  const pathname = usePathname();
  
  // Hide footer on specified pages
  if (PAGES_WITHOUT_FOOTER.includes(pathname)) {
    return null;
  }

  return <Footer content={content} />;
}
