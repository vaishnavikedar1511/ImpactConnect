/**
 * Personalize Context Provider
 * 
 * Provides Personalize SDK instance to all client components
 * Based on Contentstack documentation:
 * https://www.contentstack.com/docs/personalize/setup-nextjs-website-with-personalize-launch
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { personalizeService } from '@/lib/contentstack/personalize-service';
import { getPrimaryCause } from '@/lib/user/storage';
import type { Sdk } from '@contentstack/personalize-edge-sdk/dist/sdk';

const PersonalizeContext = createContext<Sdk | null>(null);

export interface PersonalizeProviderProps {
  children: ReactNode;
}

/**
 * Personalize Provider Component
 * Initializes the SDK and provides it via Context
 */
export function PersonalizeProvider({ children }: PersonalizeProviderProps) {
  const [sdk, setSdk] = useState<Sdk | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeSDK() {
      try {
        // Wait for SDK to initialize
        await personalizeService['ensureInitialized']();
        
        // Get SDK instance
        const sdkInstance = personalizeService.getSDK();
        setSdk(sdkInstance);
        
        if (sdkInstance) {
          console.log('✅ Personalize Context initialized');
          
          // Set user attributes from latest registration
          const primaryCause = getPrimaryCause();
          if (primaryCause) {
            console.log('[Personalize Context] Setting primary cause:', primaryCause);
            await personalizeService.setUserAttributes({ primaryCause });
          } else {
            console.log('[Personalize Context] No primary cause found');
          }
        } else {
          console.warn('⚠️ Personalize SDK not available');
        }
      } catch (error) {
        console.error('❌ Failed to initialize Personalize Context:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeSDK();
    
    // Poll for changes in registrations (every 3 seconds)
    const intervalId = setInterval(async () => {
      const currentCause = getPrimaryCause();
      const lastCause = (window as any).__lastPersonalizeCause;
      
      if (currentCause !== lastCause) {
        (window as any).__lastPersonalizeCause = currentCause;
        console.log('[Personalize Context] Primary cause changed to:', currentCause);
        
        if (currentCause) {
          await personalizeService.setUserAttributes({ primaryCause: currentCause });
        }
      }
    }, 3000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Show loading state if needed (optional)
  if (isLoading) {
    // You can return a loading spinner here if needed
    // For now, we'll just render children
  }

  return (
    <PersonalizeContext.Provider value={sdk}>
      {children}
    </PersonalizeContext.Provider>
  );
}

/**
 * Hook to access Personalize SDK from context
 */
export function usePersonalize(): Sdk | null {
  const context = useContext(PersonalizeContext);
  return context;
}
