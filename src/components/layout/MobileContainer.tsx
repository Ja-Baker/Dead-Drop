import type { ReactNode } from 'react';
import './MobileContainer.css';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export const MobileContainer = ({ children, className = '' }: MobileContainerProps) => {
  return (
    <div className={`mobile-container ${className}`}>
      {children}
    </div>
  );
};
