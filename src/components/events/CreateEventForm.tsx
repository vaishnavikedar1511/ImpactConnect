'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { addCreatedEvent } from '@/lib/user';
import type { CreateEventPageContent } from '@/lib/contentstack';
import styles from './CreateEventForm.module.css';

interface CreateEventFormProps {
  content: CreateEventPageContent;
}

/**
 * Country data from external API
 */
interface Country {
  name: string;
  iso2: string;
}

interface State {
  name: string;
  state_code: string;
}

interface City {
  name: string;
}

/**
 * Cause options (should match Contentstack causes)
 */
const CAUSES = [
  { slug: 'education', name: 'Education' },
  { slug: 'environment', name: 'Environment' },
  { slug: 'healthcare', name: 'Healthcare' },
  { slug: 'animal-welfare', name: 'Animal Welfare' },
];

/**
 * Contribution type options
 */
const CONTRIBUTION_TYPES = [
  { value: 'physical_effort', label: 'Physical Effort' },
  { value: 'skills', label: 'Skills & Expertise' },
  { value: 'resources', label: 'Resources / Donations' },
  { value: 'time', label: 'Time & Commitment' },
];

interface FormData {
  title: string;
  summary: string;
  description: string;
  // Cover Image
  coverImageUid: string;
  coverImageUrl: string;
  // Location fields
  country: string;
  state: string;
  city: string;
  address: string;
  isVirtual: boolean;
  // Categories
  causes: string[];
  contributionTypes: string[];
  // Date & Time
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  // Organizer
  organizerEmail: string;
  organizerName: string;
  // Other
  spotsAvailable: string;
  requirements: string;
}

interface FormErrors {
  [key: string]: string;
}

// External API for countries/states/cities
const COUNTRIES_API = 'https://countriesnow.space/api/v0.1';

export function CreateEventForm({ content }: CreateEventFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    summary: '',
    description: '',
    coverImageUid: '',
    coverImageUrl: '',
    country: '',
    state: '',
    city: '',
    address: '',
    isVirtual: false,
    causes: [],
    contributionTypes: [],
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    organizerEmail: '',
    organizerName: '',
    spotsAvailable: '',
    requirements: '',
  });

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Location data from external API
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch(`${COUNTRIES_API}/countries`);
        const result = await response.json();
        if (!result.error && result.data) {
          // Sort alphabetically
          const sortedCountries = result.data
            .map((c: { country: string; iso2: string }) => ({ name: c.country, iso2: c.iso2 }))
            .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
          setCountries(sortedCountries);
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        // Fallback to common countries
        setCountries([
          { name: 'India', iso2: 'IN' },
          { name: 'United States', iso2: 'US' },
          { name: 'United Kingdom', iso2: 'GB' },
          { name: 'Canada', iso2: 'CA' },
          { name: 'Australia', iso2: 'AU' },
          { name: 'Germany', iso2: 'DE' },
        ]);
      } finally {
        setIsLoadingCountries(false);
      }
    }
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (!formData.country) {
      setStates([]);
      return;
    }

    async function fetchStates() {
      setIsLoadingStates(true);
      setCities([]);
      try {
        const response = await fetch(`${COUNTRIES_API}/countries/states`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: formData.country }),
        });
        const result = await response.json();
        if (!result.error && result.data?.states) {
          const sortedStates = result.data.states
            .map((s: { name: string; state_code: string }) => ({ name: s.name, state_code: s.state_code }))
            .sort((a: State, b: State) => a.name.localeCompare(b.name));
          setStates(sortedStates);
        } else {
          setStates([]);
        }
      } catch (error) {
        console.error('Failed to fetch states:', error);
        setStates([]);
      } finally {
        setIsLoadingStates(false);
      }
    }
    fetchStates();
  }, [formData.country]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.country || !formData.state) {
      setCities([]);
      return;
    }

    async function fetchCities() {
      setIsLoadingCities(true);
      try {
        const response = await fetch(`${COUNTRIES_API}/countries/state/cities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: formData.country, state: formData.state }),
        });
        const result = await response.json();
        if (!result.error && result.data) {
          const sortedCities = result.data
            .map((city: string) => ({ name: city }))
            .sort((a: City, b: City) => a.name.localeCompare(b.name));
          setCities(sortedCities);
        } else {
          setCities([]);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    }
    fetchCities();
  }, [formData.country, formData.state]);

  /**
   * Handle text input changes
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Reset dependent fields when parent changes
    if (name === 'country') {
      setFormData((prev) => ({ ...prev, country: value, state: '', city: '' }));
    } else if (name === 'state') {
      setFormData((prev) => ({ ...prev, state: value, city: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handle checkbox changes (causes, contribution types)
   */
  const handleCheckboxChange = (field: 'causes' | 'contributionTypes', value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });

    // Clear error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Handle image selection
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, coverImage: 'Invalid file type. Use JPEG, PNG, GIF, or WebP' }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, coverImage: 'Image too large. Maximum 5MB' }));
      return;
    }

    setImageFile(file);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.coverImage;
      return newErrors;
    });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Remove selected image
   */
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, coverImageUid: '', coverImageUrl: '' }));
  };

  /**
   * Upload image to Contentstack
   */
  const uploadImage = async (): Promise<{ uid: string; url: string } | null> => {
    if (!imageFile) return null;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('/api/upload-asset', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors((prev) => ({ ...prev, coverImage: result.error || 'Failed to upload image' }));
        return null;
      }

      return { uid: result.asset.uid, url: result.asset.url };
    } catch (error) {
      console.error('Image upload error:', error);
      setErrors((prev) => ({ ...prev, coverImage: 'Failed to upload image' }));
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  /**
   * Handle virtual toggle
   */
  const handleVirtualToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isVirtual: !prev.isVirtual,
      // Clear location fields when switching to virtual
      country: !prev.isVirtual ? '' : prev.country,
      state: !prev.isVirtual ? '' : prev.state,
      city: !prev.isVirtual ? '' : prev.city,
      address: !prev.isVirtual ? '' : prev.address,
    }));
  };

  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim() || formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.summary.trim() || formData.summary.length < 20) {
      newErrors.summary = 'Summary must be at least 20 characters';
    }

    // Location validation (not required for virtual events)
    if (!formData.isVirtual) {
      if (!formData.country) {
        newErrors.country = 'Please select a country';
      }
    }

    if (formData.causes.length === 0) {
      newErrors.causes = 'Please select at least one cause';
    }

    if (formData.contributionTypes.length === 0) {
      newErrors.contributionTypes = 'Please select at least one contribution type';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.startDate = 'Start date must be in the future';
      }
    }

    if (!formData.organizerEmail.trim()) {
      newErrors.organizerEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizerEmail)) {
      newErrors.organizerEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image first if selected
      let coverImageData: { uid: string; url: string } | null = null;
      if (imageFile) {
        coverImageData = await uploadImage();
        if (!coverImageData) {
          setIsSubmitting(false);
          return; // Upload failed, error already set
        }
      }

      const response = await fetch('/api/submit-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          summary: formData.summary,
          description: formData.description,
          coverImageUid: coverImageData?.uid || '',
          coverImageUrl: coverImageData?.url || '',
          country: formData.country,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          isVirtual: formData.isVirtual,
          contributionTypes: formData.contributionTypes,
          causes: formData.causes,
          startDate: formData.startDate,
          endDate: formData.endDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          organizerEmail: formData.organizerEmail,
          organizerName: formData.organizerName,
          spotsAvailable: formData.spotsAvailable ? parseInt(formData.spotsAvailable) : undefined,
          requirements: formData.requirements,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.details) {
          setSubmitError(result.details.join(', '));
        } else {
          setSubmitError(result.error || 'Failed to submit event. Please try again.');
        }
        return;
      }

      // Save to localStorage for "My Events" page
      try {
        addCreatedEvent({
          id: result.data?.submissionId || `evt_${Date.now()}`,
          title: formData.title,
          organizerEmail: formData.organizerEmail,
        });
      } catch (e) {
        console.warn('Could not save event to localStorage:', e);
      }

      // Success!
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting event:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>{content.success_icon || '🎉'}</div>
          <h2 className={styles.successTitle}>{content.success_title || 'Event Submitted!'}</h2>
          <p className={styles.successText}>
            {content.success_message || 'Thank you for submitting your event. Our team will review it shortly. Once approved, it will appear in the Discover section.'}
          </p>
          <Link href={content.success_button_link || '/opportunities'} className={styles.successButton}>
            {content.success_button_text || 'Browse Opportunities'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <header className={styles.formHeader}>
        <h1 className={styles.formTitle}>{content.page_title || 'Create an Event'}</h1>
        <p className={styles.formSubtitle}>
          {content.page_subtitle || 'Submit your event for review. Once approved, it will be visible to the community.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {submitError && (
          <div className={styles.globalError}>{submitError}</div>
        )}

        {/* Basic Info Section */}
        <div className={styles.sectionTitle}>{content.section_details_title || 'Event Details'}</div>

        <div className={styles.fieldGroup}>
          <label htmlFor="title" className={styles.label}>
            Event Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Beach Cleanup Drive at Juhu"
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
            maxLength={100}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="summary" className={styles.label}>
            Short Summary <span className={styles.required}>*</span>
          </label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            placeholder="Briefly describe your event (shown in listings)"
            className={`${styles.textarea} ${errors.summary ? styles.inputError : ''}`}
            maxLength={300}
          />
          {errors.summary && <span className={styles.errorText}>{errors.summary}</span>}
          <span className={styles.helperText}>{formData.summary.length}/300 characters</span>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="description" className={styles.label}>
            Full Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide detailed information about the event, requirements, what to expect, etc."
            className={styles.textarea}
            style={{ minHeight: '180px' }}
            maxLength={2000}
          />
          <span className={styles.helperText}>Optional - {formData.description.length}/2000 characters</span>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Cover Image
          </label>
          {imagePreview ? (
            <div className={styles.imagePreviewContainer}>
              <img
                src={imagePreview}
                alt="Cover preview"
                className={styles.imagePreview}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className={styles.removeImageButton}
                disabled={isUploadingImage}
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <div className={styles.imageUploadArea}>
              <input
                type="file"
                id="coverImage"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              <label htmlFor="coverImage" className={styles.fileInputLabel}>
                <span className={styles.uploadIcon}>📷</span>
                <span>Click to upload an image</span>
                <span className={styles.helperText}>JPEG, PNG, GIF, WebP (max 5MB)</span>
              </label>
            </div>
          )}
          {errors.coverImage && <span className={styles.errorText}>{errors.coverImage}</span>}
          {isUploadingImage && <span className={styles.helperText}>Uploading image...</span>}
        </div>

        <hr className={styles.sectionDivider} />
        <div className={styles.sectionTitle}>{content.section_location_title || 'Location'}</div>

        <div className={styles.fieldGroup}>
          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={formData.isVirtual}
              onChange={handleVirtualToggle}
              className={styles.switchInput}
            />
            <span className={styles.switch} />
            <span>{content.virtual_label || 'This is a virtual/remote event'}</span>
          </label>
        </div>

        {!formData.isVirtual && (
          <>
            {isLoadingCountries ? (
              <div className={styles.helperText}>Loading countries...</div>
            ) : (
              <>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="country" className={styles.label}>
                      Country <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`${styles.select} ${errors.country ? styles.inputError : ''}`}
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country.iso2} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.country && <span className={styles.errorText}>{errors.country}</span>}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="state" className={styles.label}>
                      State / Province
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={styles.select}
                      disabled={!formData.country || isLoadingStates}
                    >
                      <option value="">
                        {isLoadingStates ? 'Loading...' : 'Select a state'}
                      </option>
                      {states.map((state) => (
                        <option key={state.state_code} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    {states.length === 0 && formData.country && !isLoadingStates && (
                      <span className={styles.helperText}>No states available - you can type in city below</span>
                    )}
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="city" className={styles.label}>
                      City
                    </label>
                    {cities.length > 0 ? (
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={styles.select}
                        disabled={isLoadingCities}
                      >
                        <option value="">
                          {isLoadingCities ? 'Loading...' : 'Select a city'}
                        </option>
                        {cities.map((city, index) => (
                          <option key={`${city.name}-${index}`} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city name"
                        className={styles.input}
                      />
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="address" className={styles.label}>
                      Detailed Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g., Juhu Beach, near lifeguard tower"
                      className={styles.input}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <hr className={styles.sectionDivider} />
        <div className={styles.sectionTitle}>Categories</div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Causes <span className={styles.required}>*</span>
          </label>
          <div className={styles.checkboxGroup}>
            {CAUSES.map((cause) => (
              <label
                key={cause.slug}
                className={`${styles.checkboxLabel} ${
                  formData.causes.includes(cause.slug) ? styles.checked : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.causes.includes(cause.slug)}
                  onChange={() => handleCheckboxChange('causes', cause.slug)}
                  className={styles.checkboxInput}
                />
                {cause.name}
              </label>
            ))}
          </div>
          {errors.causes && <span className={styles.errorText}>{errors.causes}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Contribution Types <span className={styles.required}>*</span>
          </label>
          <div className={styles.checkboxGroup}>
            {CONTRIBUTION_TYPES.map((type) => (
              <label
                key={type.value}
                className={`${styles.checkboxLabel} ${
                  formData.contributionTypes.includes(type.value) ? styles.checked : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.contributionTypes.includes(type.value)}
                  onChange={() => handleCheckboxChange('contributionTypes', type.value)}
                  className={styles.checkboxInput}
                />
                {type.label}
              </label>
            ))}
          </div>
          {errors.contributionTypes && (
            <span className={styles.errorText}>{errors.contributionTypes}</span>
          )}
        </div>

        <hr className={styles.sectionDivider} />
        <div className={styles.sectionTitle}>Date & Time</div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="startDate" className={styles.label}>
              Start Date <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className={`${styles.input} ${errors.startDate ? styles.inputError : ''}`}
            />
            {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="endDate" className={styles.label}>
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              className={styles.input}
            />
            <span className={styles.helperText}>Optional - for multi-day events</span>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="startTime" className={styles.label}>
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="endTime" className={styles.label}>
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>
        </div>

        <hr className={styles.sectionDivider} />
        <div className={styles.sectionTitle}>Additional Details</div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="spotsAvailable" className={styles.label}>
              Spots Available
            </label>
            <input
              type="number"
              id="spotsAvailable"
              name="spotsAvailable"
              value={formData.spotsAvailable}
              onChange={handleInputChange}
              placeholder="e.g., 50"
              min="1"
              className={styles.input}
            />
            <span className={styles.helperText}>Optional - leave blank for unlimited</span>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="requirements" className={styles.label}>
              Requirements / Notes
            </label>
            <input
              type="text"
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="e.g., Bring gloves, wear comfortable shoes, any notes..."
              className={styles.input}
            />
          </div>
        </div>

        <hr className={styles.sectionDivider} />
        <div className={styles.sectionTitle}>Contact Information</div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="organizerName" className={styles.label}>
              Your Name / Organization
            </label>
            <input
              type="text"
              id="organizerName"
              name="organizerName"
              value={formData.organizerName}
              onChange={handleInputChange}
              placeholder="e.g., Green Earth Foundation"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="organizerEmail" className={styles.label}>
              Contact Email <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="organizerEmail"
              name="organizerEmail"
              value={formData.organizerEmail}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className={`${styles.input} ${errors.organizerEmail ? styles.inputError : ''}`}
            />
            {errors.organizerEmail && (
              <span className={styles.errorText}>{errors.organizerEmail}</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Event for Review'}
        </button>

        <p className={styles.helperText} style={{ textAlign: 'center' }}>
          Your event will be reviewed by our team before being published.
        </p>
      </form>
    </div>
  );
}
