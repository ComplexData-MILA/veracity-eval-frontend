"use client"

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import styles from "./login.module.scss";

export default function LoginButton() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  const handleAuth = (action: 'login' | 'logout') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (action === 'login') {router.push(`/api/auth/login?returnTo=/chat`)} else {router.push(`/api/auth/logout`)}
  };

  if (user) {
    return (<div className={styles.logout}>
    <p>{user.name}</p>
      <button onClick={handleAuth('logout')}>
        logout
      </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleAuth('login')}>
      <button>login</button>
    </div>
  );
}