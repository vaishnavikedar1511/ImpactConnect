'use client';

/**
 * LocationSelector Component
 * Location-first selection for browsing opportunities
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { LocationReference } from '@/types';
import styles from './LocationSelector.module.css';

interface LocationSelectorProps {
  locations: LocationReference[];
  selectedLocation: string | null;
  onLocationSelect: (locationSlug: string | null, isVirtual?: boolean) => void;
  popularLocations?: LocationReference[];
}

export function LocationSelector({
  locations,
  selectedLocation,
  onLocationSelect,
  popularLocations,
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return locations
      .filter(
        (loc) =>
          loc.name.toLowerCase().includes(query) ||
          loc.slug.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [locations, searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  }, []);

  const handleLocationClick = useCallback(
    (slug: string) => {
      onLocationSelect(slug, false);
      setSearchQuery('');
      setIsOpen(false);
    },
    [onLocationSelect]
  );

  const handleVirtualClick = useCallback(() => {
    onLocationSelect(null, true);
  }, [onLocationSelect]);

  const handleChangeLocation = useCallback(() => {
    onLocationSelect(null, false);
    setSearchQuery('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [onLocationSelect]);

  // Find selected location details
  const selectedLocationDetails = useMemo(() => {
    if (!selectedLocation) return null;
    return locations.find((loc) => loc.slug === selectedLocation);
  }, [locations, selectedLocation]);

  // Default popular locations (top 6 cities if not provided)
  const displayPopular = popularLocations || locations.filter((l) => l.type === 'city').slice(0, 6);

  // If location is already selected, show the current selection
  if (selectedLocationDetails) {
    return (
      <div className={styles.currentLocation}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        <span>{selectedLocationDetails.name}</span>
        <button
          type="button"
          className={styles.changeLocation}
          onClick={handleChangeLocation}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Icon */}
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>

      {/* Title */}
      <h2 className={styles.title}>Where would you like to help?</h2>
      <p className={styles.subtitle}>
        Select a location to discover impact opportunities near you
      </p>

      {/* Search Input */}
      <div className={styles.searchWrapper} ref={containerRef}>
        <svg
          className={styles.searchIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Search for a city or area..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          aria-label="Search locations"
          aria-expanded={isOpen && filteredLocations.length > 0}
          aria-controls="location-suggestions"
          autoComplete="off"
        />

        {/* Suggestions Dropdown */}
        {isOpen && searchQuery && (
          <div
            id="location-suggestions"
            className={styles.suggestions}
            role="listbox"
            aria-label="Location suggestions"
          >
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <button
                  key={location.uid}
                  type="button"
                  className={styles.suggestionItem}
                  onClick={() => handleLocationClick(location.slug)}
                  role="option"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>{location.name}</span>
                  <span className={styles.suggestionType}>{location.type}</span>
                </button>
              ))
            ) : (
              <div className={styles.noResults}>No locations found</div>
            )}
          </div>
        )}
      </div>

      {/* Popular Locations */}
      {displayPopular.length > 0 && (
        <div className={styles.popularSection}>
          <span className={styles.popularLabel}>Popular locations</span>
          <div className={styles.popularGrid}>
            {displayPopular.map((location) => (
              <button
                key={location.uid}
                type="button"
                className={styles.popularButton}
                onClick={() => handleLocationClick(location.slug)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {location.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Virtual Option */}
      <div className={styles.virtualOption}>
        <button
          type="button"
          className={styles.virtualButton}
          onClick={handleVirtualClick}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.97.633-3.79 1.706-5.27" />
          </svg>
          Browse Virtual Opportunities
        </button>
      </div>
    </div>
  );
}

export default LocationSelector;
