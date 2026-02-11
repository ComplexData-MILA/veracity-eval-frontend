"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./login.module.scss";
import { redirect } from "next/navigation";
import { useAuthApi } from '@/app/hooks/useAuthApi';

export default function TinyLogin({ label }: { label: string }) {
  const { user, error, fetchToken } = useAuthApi();
  const router = useRouter();

  if (user){
    fetchToken().catch(console.error);
    redirect('/chat');
  } 

  useEffect(() => {
    if (user) {
      fetchToken().catch(console.error);
      router.push('/chat'); // Internal app navigation is fine with router.push
    }
  }, [user, fetchToken, router]);

  if (error) return <div className={styles.error}>{error.message}</div>;

  const handleAuth = (action: 'login' | 'logout' | 'signup') => (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Use window.location.assign for a clean browser-level redirect
    // This bypasses the Next.js background "fetch" that triggers CORS errors
    if (action === 'login') {
      window.location.assign('/api/auth/login?returnTo=/chat');
    } else if (action === 'signup') {
      // Note: screen_hint=signup is the standard for most Auth0 SDKs
      window.location.assign('/api/auth/login?screen_hint=signup&returnTo=/chat');
    } else {
      window.location.assign('/api/auth/logout');
    }
  };

  // If user is already logged in, we don't need to show the login button
  if (user) return null;

  return (
    <div>
      <button 
        className={styles.tinyLogin} 
        onClick={handleAuth('login')}
      >
        {label}
      </button>
    </div>
  );
  
}