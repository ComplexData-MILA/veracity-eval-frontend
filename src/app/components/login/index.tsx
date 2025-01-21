"use client"

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import styles from "./login.module.scss";
import Link from 'next/link';
import { redirect } from "next/navigation";

export default function LoginButton(text: {label:string}) {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (user) redirect('/chat');

  const handleAuth = (action: 'login' | 'logout') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (action === 'login') {router.push(`/api/auth/login?returnTo=/chat`)} else {router.push(`/api/auth/logout`)}
  };

  if (user) {
    return (<div className={styles.userBlock}>
    <div>
      <button className={styles.logout} onClick={handleAuth('logout')}>
        Logout
      </button>
      <Link className={styles.continue} href="/chat">Continue</Link>
      </div>
      </div>
    );
  }
  return (
    <div>
      <button className={styles.login} onClick={handleAuth('login')}>{text.label}</button>
    </div>
  );
}