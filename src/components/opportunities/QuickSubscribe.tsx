'use client';

/**
 * QuickSubscribe Component
 * Subscription form shown after event registration
 * Matches black + purple theme
 */

import { useState } from 'react';
import styles from './QuickSubscribe.module.css';

interface QuickSubscribeProps {
  prefillEmail?: string;
  prefillCity?: string;
  onSuccess?: () => void;
}

export function QuickSubscribe({ 
  prefillEmail = '', 
  prefillCity = '', 
  onSuccess 
}: QuickSubscribeProps) {
  const [email, setEmail] = useState(prefillEmail);
  const [citySlug, setCitySlug] = useState(prefillCity);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const CITIES = [
    { name: 'Mumbai', slug: 'mumbai' },
    { name: 'Delhi', slug: 'delhi' },
    { name: 'Bangalore', slug: 'bangalore' },
    { name: 'Pune', slug: 'pune' },
    { name: 'Chennai', slug: 'chennai' },
    { name: 'Hyderabad', slug: 'hyderabad' },
    { name: 'Kolkata', slug: 'kolkata' },
    { name: 'Ahmedabad', slug: 'ahmedabad' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, citySlug }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('✅ Subscribed! You\'ll get notified about new events.');
        onSuccess?.();
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.successState}>
        <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className={styles.successText}>{message}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>🔔</span>
        <div className={styles.headerText}>
          <h4 className={styles.title}>Want More Events Like This?</h4>
          <p className={styles.subtitle}>Get notified when new events are posted in your city</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
          disabled={loading}
        />
        
        <select 
          value={citySlug} 
          onChange={(e) => setCitySlug(e.target.value)}
          required
          className={styles.select}
          disabled={loading}
        >
          <option value="">Select your city</option>
          {CITIES.map(city => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
        
        <button 
          type="submit" 
          disabled={loading}
          className={styles.button}
        >
          {loading ? 'Subscribing...' : 'Subscribe to Notifications'}
        </button>
      </form>

      {status === 'error' && (
        <p className={styles.errorText}>{message}</p>
      )}

      <p className={styles.disclaimer}>
        You can unsubscribe anytime from the emails
      </p>
    </div>
  );
}
