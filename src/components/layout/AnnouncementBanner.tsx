'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AnnouncementBannerContent } from '@/lib/contentstack';
import { getUserAttributesFromClient } from '@/lib/contentstack';
import { personalizeService } from '@/lib/contentstack/personalize-service';
import { usePersonalize } from '@/components/context/PersonalizeContext';
import styles from './AnnouncementBanner.module.css';

interface AnnouncementBannerProps {
  content: AnnouncementBannerContent;
}

export function AnnouncementBanner({ content }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<AnnouncementBannerContent | null>(null);
  const personalizeSDK = usePersonalize();

  // Fetch personalized content on mount
  useEffect(() => {
    const fetchPersonalizedContent = async () => {
      console.log('\n=== ANNOUNCEMENT BANNER PERSONALIZE ===');
      console.log('SDK Available:', !!personalizeSDK);
      console.log('Service Initialized:', personalizeService.isInitialized());
      
      // Wait for SDK to be available
      if (!personalizeSDK) {
        console.log('⏳ Waiting for Personalize SDK to initialize...');
        console.log('   Check browser console for SDK initialization logs');
        return;
      }
      
      // Ensure SDK is initialized
      if (!personalizeService.isInitialized()) {
        console.log('⏳ Ensuring SDK is initialized...');
        await personalizeService['ensureInitialized']();
      }

      // Get city attribute from client-side storage (set from dropdown selection)
      const userAttributes = getUserAttributesFromClient();
      const city = userAttributes.city;
      
      if (city) {
        try {
          console.log('\n=== PERSONALIZE SDK DEBUG ===');
          console.log('City:', city);
          
          // Set city attribute in Personalize SDK
          await personalizeService.setUserAttributes({
            city: city,
          });
          
          // Give SDK a moment to process the attribute and re-evaluate segments
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Use Experience 9 for city-based personalization
          const experienceShortUid = '9'; // Announcement Experience
          console.log('Using City-based Experience (Short UID: 9)');
          
          // Get active variant for this experience
          const variantShortUid = personalizeService.getActiveVariant(experienceShortUid);
          console.log('Experience Short UID:', experienceShortUid);
          console.log('Active Variant Short UID:', variantShortUid);
          
          if (variantShortUid === null || variantShortUid === undefined) {
            console.warn('⚠️ No variant selected for Experience 9. Check segment conditions in Contentstack.');
            console.warn('   City value:', city);
            console.warn('   Expected segment condition: city equals "' + city + '"');
            return;
          }
          
          // Trigger impression
          await personalizeService.triggerImpression(experienceShortUid);
          
          // Get variant aliases for fetching content
          const variantAliases = personalizeService.getVariantAliases();
          console.log('Variant Aliases:', variantAliases);
          console.log('Variant Aliases (expanded):', JSON.stringify(variantAliases));
          console.log('Variant Aliases length:', variantAliases.length);
          
          // Filter variants for Experience 9 ONLY (city-based personalization)
          // Note: Experience 5 is currently disabled/hidden
          const experience9Variants = variantAliases.filter(alias => 
            alias.includes('cs_personalize_9_')
          );
          
          // Log Experience 5 variants if present (for debugging - but not using them)
          const experience5Variants = variantAliases.filter(alias => 
            alias.includes('cs_personalize_5_')
          );
          if (experience5Variants.length > 0) {
            console.log('ℹ️ Experience 5 variants detected but ignored (hidden for now):', experience5Variants);
          }
          
          console.log('Variants for Experience 9:', experience9Variants);
          
          if (experience9Variants.length === 0) {
            console.warn('⚠️ No Experience 9 variants found. Found variants:', variantAliases);
            console.warn('   This might mean segments are not matching or experience is not set up correctly.');
            return;
          }
          
          console.log('✅ Using only Experience 9 (city-based), ignoring other experiences');
          
          // MAPPING: Variant Alias → Variant UID (confirmed mapping for Pune)
          const PUNE_VARIANT_UID = 'csbab26fa8a3ee82eb'; // cs_personalize_9_0 → Pune
          
          // Check if we have the Pune variant alias
          const hasPuneVariant = experience9Variants.includes('cs_personalize_9_0');
          
          if (!hasPuneVariant) {
            console.warn('⚠️ Pune variant (cs_personalize_9_0) not found. Variants:', experience9Variants);
            return;
          }
          
          console.log('✅ Pune variant detected (cs_personalize_9_0)');
          console.log('✅ Mapping to Pune UID:', PUNE_VARIANT_UID);
          
          // Fetch personalized content using Pune variant UID
            const response = await fetch('/api/personalize-content', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
                body: JSON.stringify({
                  contentTypeUid: 'announcement_banner',
              entryUid: 'blt83824e53588acb6a',
              variantUIDs: [PUNE_VARIANT_UID], // Using UID instead of alias
                }),
            });
            
            if (response.ok) {
              const result = await response.json();
              const personalized = result.content as AnnouncementBannerContent;
              
              console.log('API Response:', result);
              console.log('Personalized content:', personalized);
              console.log('Message:', personalized?.message);
              console.log('Message length:', personalized?.message?.length);
              console.log('All content keys:', Object.keys(personalized || {}));
              
              if (personalized?.message) {
                setPersonalizedContent({
                  ...content,
                  ...personalized,
                  message: personalized.message,
                });
                
                const isDefaultMessage = personalized.message.includes('Join us in making a difference');
                if (!isDefaultMessage) {
                  console.log('✅ Using personalized message:', personalized.message);
                } else {
                  console.warn('⚠️ Still showing default message. Variant may not be configured correctly.');
                }
              }
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('❌ Failed to fetch personalized content:', response.status, errorData);
          }
          
          console.log('===================================\n');
        } catch (error) {
          console.error('❌ Failed to load personalized announcement banner:', error);
          // Keep default content on error
        }
      } else {
        console.log('ℹ️ No city selected. Using default content.');
      }
    };

    fetchPersonalizedContent();
    
    // Check periodically for city changes (since same-tab localStorage changes don't trigger storage event)
    const intervalId = setInterval(() => {
      const currentCity = localStorage.getItem('userCity');
      const lastCity = (window as any).__lastCity;
      if (currentCity !== lastCity) {
        (window as any).__lastCity = currentCity;
        if (currentCity) {
          console.log('🔄 City changed detected, refreshing banner...');
          fetchPersonalizedContent();
        }
      }
    }, 500);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [personalizeSDK, content]);

  // Use personalized content if available, otherwise use default content
  const displayContent = personalizedContent || content;

  useEffect(() => {
    // Check if banner should be visible based on dates
    const now = new Date();
    const startDate = displayContent.start_date ? new Date(displayContent.start_date) : null;
    const endDate = displayContent.end_date ? new Date(displayContent.end_date) : null;

    const isWithinDateRange = 
      (!startDate || now >= startDate) && 
      (!endDate || now <= endDate);

    // Check if user has dismissed this banner (using message as key)
    const dismissedKey = `banner_dismissed_${btoa(displayContent.message || '').slice(0, 20)}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';

    setIsVisible(displayContent.enabled === true && isWithinDateRange && !wasDismissed);
  }, [displayContent]);

  const handleDismiss = () => {
    const dismissedKey = `banner_dismissed_${btoa(displayContent.message || '').slice(0, 20)}`;
    localStorage.setItem(dismissedKey, 'true');
    setDismissed(true);
  };

  if (!isVisible || dismissed || !displayContent.message) {
    return null;
  }

  const colorClass = styles[displayContent.background_color || 'info'] || styles.info;

  return (
    <div className={`${styles.banner} ${colorClass}`}>
      <div className={styles.content}>
        {displayContent.icon && <span className={styles.icon}>{displayContent.icon}</span>}
        <p className={styles.message}>
          {displayContent.message}
          {displayContent.link_text && displayContent.link_url && (
            <>
              {' '}
              <Link href={displayContent.link_url} className={styles.link}>
                {displayContent.link_text} →
              </Link>
            </>
          )}
        </p>
      </div>
      {displayContent.dismissible !== false && (
        <button
          type="button"
          className={styles.dismissButton}
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
