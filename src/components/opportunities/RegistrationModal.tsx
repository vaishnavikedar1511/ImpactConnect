'use client';

/**
 * RegistrationModal Component
 * Modal with registration form for opportunities
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Opportunity } from '@/types';
import { formatDisplayDate } from '@/lib/utils';
import { addRegistration } from '@/lib/user';
import styles from './RegistrationModal.module.css';

interface RegistrationModalProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  agreeToTerms?: string;
  general?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function RegistrationModal({ opportunity, isOpen, onClose }: RegistrationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  // Build location display string - either Virtual OR physical location
  const locationDisplay = opportunity.isVirtual 
    ? 'Virtual / Online' 
    : [opportunity.city, opportunity.state, opportunity.country].filter(Boolean).join(', ');

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      const previouslyFocused = document.activeElement as HTMLElement;

      // Focus the first input after animation
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';
        previouslyFocused?.focus();
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s\-+()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));

      // Clear error on change
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setStatus('submitting');

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Opportunity details
            opportunityId: opportunity.uid,
            opportunityTitle: opportunity.title,
            opportunitySlug: opportunity.slug,
            opportunityDate: opportunity.startDate,
            opportunityTime: opportunity.startTime,
            opportunityLocation: locationDisplay,
            isVirtual: opportunity.isVirtual,
            // Organizer details
            organizerName: opportunity.organizerName,
            organizerEmail: opportunity.organizerEmail,
            // Participant details
            ...formData,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          // Handle validation errors from API
          if (result.errors && Array.isArray(result.errors)) {
            const fieldErrors: FormErrors = {};
            result.errors.forEach((err: { field: string; message: string }) => {
              if (err.field in formData) {
                fieldErrors[err.field as keyof FormErrors] = err.message;
              }
            });
            if (Object.keys(fieldErrors).length > 0) {
              setErrors(fieldErrors);
              setStatus('error');
              return;
            }
          }
          throw new Error(result.message || 'Registration failed');
        }

        // Save registration to localStorage for "My Registrations" page
        try {
          addRegistration({
            opportunityId: opportunity.uid,
            opportunityTitle: opportunity.title,
            opportunitySlug: opportunity.slug,
            opportunityDate: opportunity.startDate,
            opportunityLocation: locationDisplay,
            name: formData.name,
            email: formData.email,
          });
        } catch (e) {
          console.warn('Could not save registration to localStorage:', e);
        }

        setStatus('success');
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({
          general: error instanceof Error 
            ? error.message 
            : 'Something went wrong. Please try again or contact the organizer directly.',
        });
        setStatus('error');
      }
    },
    [formData, opportunity, locationDisplay, validateForm]
  );

  // Reset form
  const handleReset = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      agreeToTerms: false,
    });
    setErrors({});
    setStatus('idle');
  }, []);

  // Handle close after success
  const handleSuccessClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-title"
    >
      <div className={styles.modal} ref={modalRef}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 id="registration-title" className={styles.title}>
              {status === 'success' ? 'Registration Submitted!' : 'Register for This Opportunity'}
            </h2>
            {status !== 'success' && (
              <p className={styles.subtitle}>Fill in your details to express interest</p>
            )}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {status === 'success' ? (
            // Success State
            <div className={styles.success}>
              <svg className={styles.successIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <h3 className={styles.successTitle}>You&apos;re All Set!</h3>
              <p className={styles.successMessage}>
                Your registration for <strong>{opportunity.title}</strong> has been submitted.
                The organizer will contact you with more details.
              </p>
              <button
                type="button"
                className={styles.successButton}
                onClick={handleSuccessClose}
              >
                Close
              </button>
            </div>
          ) : (
            // Registration Form
            <>
              {/* Opportunity Info */}
              <div className={styles.opportunityInfo}>
                {opportunity.coverImage ? (
                  <Image
                    src={opportunity.coverImage.url}
                    alt={opportunity.title}
                    width={60}
                    height={60}
                    className={styles.opportunityImage}
                  />
                ) : (
                  <div className={styles.opportunityImage} />
                )}
                <div className={styles.opportunityDetails}>
                  <h3 className={styles.opportunityTitle}>{opportunity.title}</h3>
                  <p className={styles.opportunityMeta}>
                    {formatDisplayDate(opportunity.startDate)} • {locationDisplay}
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {errors.general && (
                <div className={styles.errorAlert} role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  <span className={styles.errorAlertText}>{errors.general}</span>
                </div>
              )}

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Full Name<span className={styles.required}>*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    id="name"
                    name="name"
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <span id="name-error" className={styles.errorText}>
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <span id="email-error" className={styles.errorText}>
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : 'phone-helper'}
                  />
                  {errors.phone ? (
                    <span id="phone-error" className={styles.errorText}>
                      {errors.phone}
                    </span>
                  ) : (
                    <span id="phone-helper" className={styles.helperText}>
                      Optional - for the organizer to contact you
                    </span>
                  )}
                </div>

                {/* Message */}
                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    placeholder="Tell the organizer why you'd like to participate or any questions you have..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                {/* Terms Checkbox */}
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    className={styles.checkbox}
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    aria-invalid={!!errors.agreeToTerms}
                  />
                  <label htmlFor="agreeToTerms" className={styles.checkboxLabel}>
                    I agree to share my contact information with the organizer and accept the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </a>
                    .
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <span className={styles.errorText}>{errors.agreeToTerms}</span>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? (
                    <>
                      <div className={styles.spinner} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                      Submit Registration
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistrationModal;
