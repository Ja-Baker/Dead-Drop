import type { ReactNode } from 'react';
import './Card.css';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({
  children,
  onClick,
  className = '',
  hoverable = false,
}: CardProps) => {
  return (
    <div
      className={`card ${hoverable || onClick ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};
