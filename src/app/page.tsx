import Image from "next/image";
import styles from "./page.module.scss";
import Pill from "./components/pill";
import Link from "next/link";
import LoginButton from "./components/login";

export default function Home() {
  return (
    <div className={styles.page}>
      <LoginButton />
      <main className={styles.main}>
      
        <div className={styles.textWrapper}>
          <div className="center" >
            <Pill text="UNLOCK CONVERSATIONAL POWER" />
          </div>
          <h1 className={styles.heading}>Empower Your Conversations with Next-Gen Messaging Dashboard</h1>
          <p className={styles.subheading}>Unlock seamless communication and streamline your messaging experience with our innovative dashboard solution</p>
          <div className="center" >
            <Link href="/chat" >
              <Pill text="Get Started" />
            </Link>
          </div>
        </div>
        <div className={styles.screenshotWrapper}>
          <div className={styles.screenshot}>
          <Image src="/assets/habsScreenshot.jpeg" alt="me" width="1000" height="563" />
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <Image src="/assets/habs.svg" alt="me" width="100" height="100" />
          <Image src="/assets/habs.svg" alt="me" width="100" height="100" />
          <Image src="/assets/habs.svg" alt="me" width="100" height="100" />
        </div>
      </footer>
    </div>
  );
}
