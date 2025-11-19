import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}: InputProps) => {
  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};
