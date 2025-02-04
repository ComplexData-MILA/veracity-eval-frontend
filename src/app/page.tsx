import styles from "./page.module.scss";
import LoginButton from "./components/login";
import Image from "next/image";
import Link from "next/link";
import {useLocale, useTranslations} from 'next-intl';
import LangSwitcherHome from "./components/langSelect/homepage";
import TinyLogin from "./components/login/tinyLogin";


export default function Home() {
  const locale = useLocale();
  const t = useTranslations('homepage');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
      <Link href="/how-the-ai-works" className={styles.headerItem}>How the AI works</Link>
        <Link href="/privacy" className={styles.headerItem}>{t('privacy')}</Link>
        <a href="https://www.complexdatalab.com/people/" className={styles.headerItem}>{t('contactUs')}</a>
        <TinyLogin label={t('loginButton')}  />
        {locale === "fr" ? <LangSwitcherHome lang="en" /> : <LangSwitcherHome lang="fr" />}
      </header>
      <main className={styles.main}>
        <div className={styles.textWrapper}>
        <Image src="/assets/logoLarge.png" alt="me" width="80" height="80" />
          <h1 className={styles.heading}>{t('title')}</h1>
          <h2 className={styles.subheading}>{t('subtitle')}<span className={styles.fancyText}> {t('styledSubtitle')}</span></h2>
          <p className={styles.description}>{t('description')}</p>
        </div>
            <LoginButton label={t('loginButton')} />
      </main>
      <footer className={styles.footer}>
        <p className={styles.ourPartners}>{t('ourTrustedPartners')}</p>
        <div className={styles.logoRow}>
        <Image src="/assets/mila.png" alt="me" width="155" height="55" className={styles.mila}/>
        <Image src="/assets/udem.png" alt="me" width="133" height="55" />
        <Image src="/assets/mcgillBlack.png" alt="me" width="155" height="40" />
        </div>
      </footer>
      </div>
  );
}
