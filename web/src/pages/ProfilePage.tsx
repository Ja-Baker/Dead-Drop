import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="profile-page">
      <h1>PROFILE</h1>
      {user && (
        <div className="profile-info">
          <p>Email: {user.email}</p>
          <p>Tier: {user.subscriptionTier.toUpperCase()}</p>
          <p>You're still alive</p>
        </div>
      )}
    </div>
  );
}

