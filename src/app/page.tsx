"use client"

import styles from "./page.module.scss";
import LoginButton from "./components/login";
import Image from "next/image";
import Link from "next/link";
import {useTranslations} from 'next-intl';
import TinyLogin from "./components/login/tinyLogin";
import { useEffect } from 'react';
import {setUserLocale} from '@/services/locale';


export default function Home() {
  const locale = "en";
  const t = useTranslations('homepage');

    useEffect(() => {
      // This runs only once, on initial mount
      setUserLocale(locale)
      
    }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
      <Link href="/how-the-ai-works" className={styles.headerItem}>{t('howItWorks')}</Link>
        <Link href="/privacy" className={styles.headerItem}>{t('privacy')}</Link>
        <a href="https://www.complexdatalab.com/people/" className={styles.headerItem}>{t('contactUs')}</a>
        <div className={styles.loginWrapper}><TinyLogin label={t('loginButton') }  /> </div>
      </header>
      <main className={styles.main}>
        <div className={styles.textWrapper}>
        <Image src="/assets/logoLarge.png" alt="me" width="80" height="80" />
          <h1 className={styles.heading}>{t('title')}</h1>
          <h2 className={styles.subheading}>{t('subtitle')}<span className={styles.fancyText}> {t('styledSubtitle')}</span></h2>
          <p className={styles.description}>{t('description')}</p>
        </div>
            <LoginButton label={t('loginButton')} />
            <br/>
            <div>
            <p className={styles.ourPartners}>{t('privacyStatement')}</p>
            </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.logoWrapper}>
        <p className={styles.ourPartners}>{t('ourTrustedPartners')}</p>
        <div className={styles.logoRow}>
        <Image src="/assets/mila.png" alt="me" width="155" height="55" className={styles.mila}/>
        <Image src="/assets/udem.png" alt="me" width="133" height="55" />
        <Image src="/assets/mcgillBlack.png" alt="me" width="155" height="40" />
        </div>
        <p className={styles.ourPartners}>{t('ourSponsors')}</p>
        <div className={styles.logoRow}>
        <Image src="/assets/MEI-logo.png" alt="me" width="175" height="75" className={styles.mila}/>
        <Image src="/assets/patrimoine-canadien-logo.png" alt="me" width="205" height="95" />
        <Image src="/assets/ivado-logo.png" alt="me" width="175" height="75" />
        <Image src="/assets/cifar-logo.png" alt="me" width="155" height="50" />
        </div>
        </div>
      </footer>
      </div>
  );
}
