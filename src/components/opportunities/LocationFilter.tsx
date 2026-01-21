'use client';

/**
 * LocationFilter Component
 * Searchable dropdown for filtering opportunities by location
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { LocationReference } from '@/types';
import styles from './LocationFilter.module.css';

interface LocationFilterProps {
  locations: LocationReference[];
  selectedLocation: string | null;
  isVirtual: boolean;
  onLocationChange: (location: string | null, isVirtual: boolean) => void;
}

export function LocationFilter({
  locations,
  selectedLocation,
  isVirtual,
  onLocationChange,
}: LocationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get display value
  const getDisplayValue = () => {
    if (isVirtual) return 'Virtual / Remote';
    if (selectedLocation) {
      const location = locations.find(l => l.slug === selectedLocation);
      return location?.name || selectedLocation;
    }
    return 'All Locations';
  };

  // Filter locations based on search
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = useCallback((locationSlug: string | null, virtual: boolean = false) => {
    onLocationChange(locationSlug, virtual);
    setIsOpen(false);
    setSearchQuery('');
  }, [onLocationChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  }, []);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <label className={styles.label}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.labelIcon}>
          <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        Select Location
      </label>

      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={styles.triggerValue}>{getDisplayValue()}</span>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          className={`${styles.triggerIcon} ${isOpen ? styles.triggerIconOpen : ''}`}
        >
          <path d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" onKeyDown={handleKeyDown}>
          {/* Search Input */}
          <div className={styles.searchContainer}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}>
              <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Options */}
          <div className={styles.options}>
            {/* All Locations */}
            <button
              type="button"
              className={`${styles.option} ${!selectedLocation && !isVirtual ? styles.optionSelected : ''}`}
              onClick={() => handleSelect(null, false)}
              role="option"
              aria-selected={!selectedLocation && !isVirtual}
            >
              All Locations
            </button>

            {/* Virtual Option */}
            <button
              type="button"
              className={`${styles.option} ${isVirtual ? styles.optionSelected : ''}`}
              onClick={() => handleSelect(null, true)}
              role="option"
              aria-selected={isVirtual}
            >
              Virtual / Remote
            </button>

            {/* Divider */}
            {filteredLocations.length > 0 && <div className={styles.divider} />}

            {/* City Options */}
            {filteredLocations.map((location) => (
              <button
                key={location.uid}
                type="button"
                className={`${styles.option} ${selectedLocation === location.slug ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(location.slug, false)}
                role="option"
                aria-selected={selectedLocation === location.slug}
              >
                {location.name}
              </button>
            ))}

            {/* No Results */}
            {searchQuery && filteredLocations.length === 0 && (
              <div className={styles.noResults}>
                No cities found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationFilter;
