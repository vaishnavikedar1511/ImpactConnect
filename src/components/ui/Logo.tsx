/**
 * Logo Component
 * Reusable logo component with configurable sizes
 */

import Image from 'next/image';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizes = {
  small: { width: 80, height: 20 },
  medium: { width: 120, height: 30 },
  large: { width: 200, height: 50 },
};

export function Logo({ size = 'medium', className }: LogoProps) {
  const { width, height } = sizes[size];
  
  return (
    <Image
      src="/logo.png"
      alt="ImpactConnect"
      width={width}
      height={height}
      className={className}
    />
  );
}
