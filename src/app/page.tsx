import styles from "./page.module.scss";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import LoginButton from "./components/login";
import Image from "next/image";
import translation from "./translations/homepage.json"
import Link from "next/link";

export default function Home() {

  let text = translation.fr
  if (true) text = translation.en

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/privacy" className={styles.headerItem}>{text.privacy}</Link>
        <Link href="/" locale="fr"><button className={`fi-gb fi ${styles.langSelect} ${styles.headerItem}`} /></Link>
      </header>
      <main className={styles.main}>
        <div className={styles.textWrapper}>
        <Image src="/assets/logoLarge.png" alt="me" width="80" height="80" />
          <h1 className={styles.heading}>{text.title}</h1>
          <h2 className={styles.subheading}>{text.subtitle} <span className={styles.fancyText}>{text.styledSubtitle}</span></h2>
          <p className={styles.description}>{text.description}</p>
        </div>
            <LoginButton label={text.loginButton} />
      </main>
      <footer className={styles.footer}>
        <p className={styles.ourPartners}>{text.ourTrustedPartners}</p>
        <div className={styles.logoRow}>
        <Image src="/assets/mila.png" alt="me" width="155" height="55" className={styles.mila}/>
        <Image src="/assets/udem.png" alt="me" width="133" height="55" />
        <Image src="/assets/mcgillBlack.png" alt="me" width="155" height="40" />
        </div>
      </footer>

      </div>
  );
}
