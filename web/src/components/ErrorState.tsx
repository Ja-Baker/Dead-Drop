import './ErrorState.css';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <div className="error-message">THIS FUCKED UP</div>
      <div className="error-details">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          TRY AGAIN
        </button>
      )}
    </div>
  );
}

