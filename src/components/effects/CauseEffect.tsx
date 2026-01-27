/**
 * Global Cause Effect Component
 * 
 * Displays a dynamic smoky gradient effect across all pages
 * Color matches user's primary cause from their most recent registration
 * Effect flows from left side of screen
 */

'use client';

import { useState, useEffect } from 'react';
import { getPrimaryCause } from '@/lib/user/storage';
import styles from './CauseEffect.module.css';

export function CauseEffect() {
  const [effectColor, setEffectColor] = useState('#a855f7'); // Default purple
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchCauseColor = async () => {
      // Get primary cause from most recent registration
      const primaryCause = getPrimaryCause();
      
      if (!primaryCause) {
        console.log('[CauseEffect] No primary cause detected, using default color');
        setEffectColor('#a855f7');
        setIsVisible(true);
        return;
      }

      try {
        console.log('[CauseEffect] Primary cause detected:', primaryCause);
        
        // Fetch all causes with colors from Contentstack
        const response = await fetch('/api/causes');
        
        if (response.ok) {
          const causes = await response.json();
          
          // Find matching cause dynamically
          const cause = causes.find((c: any) => c.slug === primaryCause);
          
          if (cause?.color) {
            setEffectColor(cause.color);
            console.log('[CauseEffect] Effect color set to:', cause.color, 'for cause:', cause.name);
          } else {
            console.warn('[CauseEffect] Cause found but no color, using default');
            setEffectColor('#a855f7');
          }
        } else {
          console.error('[CauseEffect] Failed to fetch causes');
          setEffectColor('#a855f7');
        }
      } catch (error) {
        console.error('[CauseEffect] Error fetching cause color:', error);
        setEffectColor('#a855f7');
      } finally {
        setIsVisible(true);
      }
    };

    fetchCauseColor();
    
    // Poll for changes in registrations (check every 2 seconds)
    const intervalId = setInterval(() => {
      const currentCause = getPrimaryCause();
      const lastCause = (window as any).__lastPrimaryCause;
      
      if (currentCause !== lastCause) {
        (window as any).__lastPrimaryCause = currentCause;
        console.log('[CauseEffect] Primary cause changed, updating effect...');
        fetchCauseColor();
      }
    }, 2000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={styles.causeEffect}
      style={{ '--smoke-color': effectColor } as React.CSSProperties}
      aria-hidden="true"
    />
  );
}
