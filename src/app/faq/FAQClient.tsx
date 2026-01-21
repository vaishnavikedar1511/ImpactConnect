'use client';

import { useState } from 'react';
import type { FAQCategory } from '@/lib/contentstack';
import { FAQIcon } from '@/components/ui';
import styles from './faq.module.css';

interface FAQClientProps {
  categories: FAQCategory[];
}

export function FAQClient({ categories }: FAQClientProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (categories.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No FAQs available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={styles.categories}>
      {categories.map((category, catIndex) => (
        <div key={catIndex} className={styles.category}>
          <h2 className={styles.categoryTitle}>
            <span className={styles.categoryIcon}>
              <FAQIcon category={category.category} />
            </span>
            {category.category}
          </h2>
          
          {category.questions && category.questions.length > 0 && (
            <div className={styles.questions}>
              {category.questions.map((item, qIndex) => {
                const itemId = `${catIndex}-${qIndex}`;
                const isOpen = openItems.has(itemId);
                
                return (
                  <div key={qIndex} className={styles.faqItem}>
                    <button
                      type="button"
                      className={`${styles.question} ${isOpen ? styles.questionOpen : ''}`}
                      onClick={() => toggleItem(itemId)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.questionText}>{item.q}</span>
                      <svg
                        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <div
                      className={`${styles.answer} ${isOpen ? styles.answerOpen : ''}`}
                      aria-hidden={!isOpen}
                    >
                      <div className={styles.answerContent}>
                        {item.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
