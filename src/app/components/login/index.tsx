"use client"

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

export default function LoginButton() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  const handleAuth = (action: 'login' | 'logout') => (e: React.MouseEvent) => {
    e.preventDefault();
    {action === 'login' ? router.push(`/api/auth/login?returnTo=/chat`) : router.push(`/api/auth/logout`)}
  };

  if (user) {
    return (
      <button onClick={handleAuth('logout')}>
        <p>{user.name}</p>
        logout
      </button>
    );
  }

  return (
    <div
      onClick={handleAuth('login')}>
      <button>login</button>
    </div>
  );
}