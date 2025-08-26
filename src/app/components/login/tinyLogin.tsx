"use client"

import { useRouter } from 'next/navigation';
import styles from "./login.module.scss";
import { redirect } from "next/navigation";
import { useAuthApi } from '@/app/hooks/useAuthApi';

export default function TinyLogin(text: {label:string}) {
  const { user, error, fetchToken } = useAuthApi();
  const router = useRouter();

  if (error) return <div>{error.message}</div>;
  if (user){
    fetchToken().catch(console.error);
    redirect('/chat');
  } 

  const handleAuth = (action: 'login' | 'logout' | 'signup') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (action === 'login') {
      router.push(`/api/auth/login?returnTo=/chat`);
    } else if (action === 'signup') {
      router.push(`/api/auth/login?signup=true&returnTo=/chat`);
    } else {
      router.push(`/api/auth/logout`);
  }
  };

  return (
    <div>
      <button className={styles.tinyLogin} onClick={handleAuth('login')}>{text.label}</button>
    </div>
  );
}