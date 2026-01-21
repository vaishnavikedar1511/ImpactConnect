import type { Metadata } from 'next';
import { Header, FooterWrapper, AnnouncementBanner } from '@/components/layout';
import { getNavbarContent, getFooterContent, getAnnouncementBannerContent } from '@/lib/contentstack';
import './globals.css';

export const metadata: Metadata = {
  title: 'ImpactConnect - Discover Social Impact Opportunities',
  description:
    'Connect with volunteering, donation drives, and community service opportunities. Make a difference in education, health, environment, and more.',
  keywords: [
    'volunteering',
    'social impact',
    'community service',
    'NGO',
    'donation',
    'charity',
    'nonprofit',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navbarContent, footerContent, bannerContent] = await Promise.all([
    getNavbarContent(),
    getFooterContent(),
    getAnnouncementBannerContent(),
  ]);

  return (
    <html lang="en">
      <body>
        <AnnouncementBanner content={bannerContent} />
        <Header content={navbarContent} />
        <main>{children}</main>
        <FooterWrapper content={footerContent} />
      </body>
    </html>
  );
}
