import './Loading.css';

export default function Loading({ message = 'LOADING YOUR DEATH...' }: { message?: string }) {
  return (
    <div className="loading-container">
      <div className="loading-text">{message}</div>
    </div>
  );
}

