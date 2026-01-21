/**
 * FAQ Page
 */

import { getFAQPageContent, parseFAQs } from '@/lib/contentstack';
import { FAQClient } from './FAQClient';
import styles from './faq.module.css';

export const metadata = {
  title: 'FAQ - ImpactConnect',
  description: 'Find answers to frequently asked questions about volunteering and using ImpactConnect.',
};

export default async function FAQPage() {
  const content = await getFAQPageContent();
  const faqCategories = parseFAQs(content.faqs_json);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>{content.page_title}</h1>
        {content.page_subtitle && (
          <p className={styles.heroSubtitle}>{content.page_subtitle}</p>
        )}
      </section>

      {/* FAQ Content */}
      <section 
        className={`${styles.content} ${content.background_image?.url ? styles.contentWithBackground : ''}`}
        style={content.background_image?.url ? {
          backgroundImage: `url(${content.background_image.url})`,
        } : undefined}
      >
        <div className={styles.container}>
          <FAQClient categories={faqCategories} />
        </div>
      </section>

      {/* Contact Section */}
      {content.contact_title && (
        <section className={styles.contactSection}>
          <div className={styles.container}>
            <h2 className={styles.contactTitle}>{content.contact_title}</h2>
            {content.contact_description && (
              <p className={styles.contactDescription}>{content.contact_description}</p>
            )}
            {content.contact_button_text && content.contact_email && (
              <a
                href={`mailto:${content.contact_email}`}
                className={styles.contactButton}
              >
                {content.contact_button_text}
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
