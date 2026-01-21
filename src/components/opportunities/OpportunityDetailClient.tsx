'use client';

/**
 * OpportunityDetailClient Component
 * Client wrapper for opportunity detail with modal state
 */

import { useState, useCallback } from 'react';
import type { Opportunity } from '@/types';
import { OpportunityDetail } from './OpportunityDetail';
import { RegistrationModal } from './RegistrationModal';

interface OpportunityDetailClientProps {
  opportunity: Opportunity;
}

export function OpportunityDetailClient({ opportunity }: OpportunityDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <OpportunityDetail
        opportunity={opportunity}
        onRegisterClick={handleOpenModal}
      />
      <RegistrationModal
        opportunity={opportunity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default OpportunityDetailClient;
