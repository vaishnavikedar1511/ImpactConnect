'use client';

import { useEffect, useState } from 'react';
import { getPrimaryCause } from '@/lib/user/storage';

/**
 * GlobalSmokeEffect Component
 * Sets CSS variable for cause-specific smoke color across all pages
 */
export function GlobalSmokeEffect() {
  const [smokeColor, setSmokeColor] = useState('#a855f7'); // Default purple

  useEffect(() => {
    const fetchCauseColor = async () => {
      const primaryCause = getPrimaryCause();
      
      if (!primaryCause) {
        // No registration, use default purple
        setSmokeColor('#a855f7');
        document.documentElement.style.setProperty('--global-smoke-color', '#a855f7');
        return;
      }

      try {
        // Fetch all causes from Contentstack
        const response = await fetch('/api/causes');
        
        if (response.ok) {
          const causes = await response.json();
          
          // Find the matching cause
          const cause = causes.find((c: any) => c.slug === primaryCause);
          
          if (cause?.color) {
            setSmokeColor(cause.color);
            document.documentElement.style.setProperty('--global-smoke-color', cause.color);
            console.log('[GlobalSmoke] Color set to:', cause.color, 'for cause:', primaryCause);
          } else {
            // Fallback to purple
            setSmokeColor('#a855f7');
            document.documentElement.style.setProperty('--global-smoke-color', '#a855f7');
          }
        }
      } catch (error) {
        console.error('[GlobalSmoke] Failed to fetch cause color:', error);
        setSmokeColor('#a855f7');
        document.documentElement.style.setProperty('--global-smoke-color', '#a855f7');
      }
    };

    fetchCauseColor();
    
    // Listen for registration changes (when localStorage changes in another tab/window)
    const handleStorageChange = () => {
      fetchCauseColor();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null; // This component doesn't render anything
}
