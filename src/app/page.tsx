import styles from "./page.module.scss";
import LoginButton from "./components/login";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.page}>
      
      <main className={styles.main}>
      
        <div className={styles.textWrapper}>
        <Image src="/assets/logoLarge.png" alt="me" width="80" height="80" />
          <h1 className={styles.heading}>Welcome to Veracity</h1>
          <h2 className={styles.subheading}>Navigate informations with clarity and confidence guided by <span className={styles.fancyText}>a conversational assistant.</span></h2>
          <p className={styles.description}>Sign up or log in to verify information and build trust with those you share it with.</p>
        </div>
            <LoginButton />
      </main>
      <footer className={styles.footer}>
        <p className={styles.ourPartners}>Our trusted partners</p>
        <div className={styles.logoRow}>
        <Image src="/assets/mila.png" alt="me" width="155" height="55" className={styles.mila}/>
        <Image src="/assets/udem.png" alt="me" width="133" height="55" />
        <Image src="/assets/mcgillBlack.png" alt="me" width="155" height="40" />
        </div>
      </footer>

      </div>
  );
}
