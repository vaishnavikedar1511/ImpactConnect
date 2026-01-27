/**
 * Contentstack Personalize Service
 * 
 * Wrapper around @contentstack/personalize-edge-sdk
 * Provides a clean interface for personalization features
 */

'use client';

import PersonalizeSDK from '@contentstack/personalize-edge-sdk';
import { getPersonalizeConfig } from './personalize-config';
import type { Sdk } from '@contentstack/personalize-edge-sdk/dist/sdk';

export interface PersonalizeVariant {
  experienceShortUid: string;
  variantShortUid: string | null;
}

export interface PersonalizeManifest {
  variants: PersonalizeVariant[];
  userUid: string;
}

class PersonalizeService {
  private sdk: Sdk | null = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private config: ReturnType<typeof getPersonalizeConfig> | null = null;

  constructor() {
    // Config is available client-side
    if (typeof window !== 'undefined') {
      this.config = getPersonalizeConfig();
    }
  }

  /**
   * Initialize the Personalize SDK
   */
  private async initializeSDK(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    try {
      console.log('[Personalize Service] Starting initialization...');
      console.log('[Personalize Service] Config:', {
        hasProjectUid: !!this.config?.projectUid,
        projectUidLength: this.config?.projectUid?.length || 0,
        edgeApiUrl: this.config?.edgeApiUrl,
      });
      
      if (!this.config?.projectUid) {
        console.error('❌ Personalize Project UID not configured');
        console.error('   Check .env.local has NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID');
        return;
      }

      // Set custom Edge API URL if configured
      if (this.config.edgeApiUrl) {
        console.log('[Personalize Service] Setting Edge API URL:', this.config.edgeApiUrl);
        PersonalizeSDK.setEdgeApiUrl(this.config.edgeApiUrl);
      } else {
        console.log('[Personalize Service] Using default Edge API URL');
      }

      console.log('[Personalize Service] Calling PersonalizeSDK.init with project UID:', this.config.projectUid);
      
      // Initialize the SDK
      this.sdk = await PersonalizeSDK.init(this.config.projectUid);
      this.initialized = true;
      
      console.log('✅ Personalize SDK initialized successfully');
      console.log('[Personalize Service] SDK instance:', !!this.sdk);
    } catch (error) {
      console.error('❌ Failed to initialize Personalize SDK:', error);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
      }
      this.initialized = false;
    }
  }

  /**
   * Ensure SDK is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeSDK();
    }
  }

  /**
   * Get the current user UID
   */
  getUserUid(): string | null {
    if (!this.sdk) return null;
    try {
      return this.sdk.getUserId() || null;
    } catch (error) {
      console.error('Failed to get user UID:', error);
      return null;
    }
  }

  /**
   * Set user attributes
   */
  async setUserAttributes(attributes: Record<string, any>): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.sdk) {
        console.warn('Personalize SDK not initialized');
        return;
      }

      await this.sdk.set(attributes);
      console.log('✅ User attributes set:', attributes);
    } catch (error) {
      console.error('❌ Failed to set user attributes:', error);
    }
  }

  /**
   * Get active variant for a specific experience
   */
  getActiveVariant(experienceShortUid: string): string | null {
    if (!this.sdk) return null;
    try {
      return this.sdk.getActiveVariant(experienceShortUid);
    } catch (error) {
      console.error('Failed to get active variant:', error);
      return null;
    }
  }

  /**
   * Get variant aliases for fetching personalized content
   */
  getVariantAliases(): string[] {
    if (!this.sdk) return [];
    try {
      return this.sdk.getVariantAliases();
    } catch (error) {
      console.error('Failed to get variant aliases:', error);
      return [];
    }
  }

  /**
   * Get manifest (all active variants)
   */
  async getManifest(): Promise<PersonalizeManifest | null> {
    try {
      await this.ensureInitialized();
      if (!this.sdk) {
        console.warn('Personalize SDK not initialized');
        return null;
      }

      const variants = this.sdk.getVariants();
      const userUid = this.sdk.getUserId();

      // Convert variants object to array format
      const variantsArray: PersonalizeVariant[] = Object.entries(variants).map(
        ([experienceShortUid, variantShortUid]) => ({
          experienceShortUid,
          variantShortUid: variantShortUid as string | null,
        })
      );

      return {
        variants: variantsArray,
        userUid: userUid || '',
      };
    } catch (error) {
      console.error('Failed to get manifest:', error);
      return null;
    }
  }

  /**
   * Trigger an impression for an experience
   */
  async triggerImpression(experienceShortUid: string): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.sdk) {
        console.warn('Personalize SDK not initialized');
        return;
      }

      await this.sdk.triggerImpression(experienceShortUid);
      console.log('✅ Impression triggered for experience:', experienceShortUid);
    } catch (error) {
      console.error('❌ Failed to trigger impression:', error);
    }
  }

  /**
   * Trigger a custom event
   */
  async triggerEvent(eventKey: string): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.sdk) {
        console.warn('Personalize SDK not initialized');
        return;
      }

      await this.sdk.triggerEvent(eventKey);
      console.log('✅ Event triggered:', eventKey);
    } catch (error) {
      console.error('❌ Failed to trigger event:', error);
    }
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.sdk !== null;
  }

  /**
   * Get the SDK instance (for advanced usage)
   */
  getSDK(): Sdk | null {
    return this.sdk;
  }
}

// Export singleton instance
export const personalizeService = new PersonalizeService();
