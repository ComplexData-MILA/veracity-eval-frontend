import styles from "./page.module.scss";
import LoginButton from "./components/login";

export default function Home() {
  return (
    <div className={styles.page}>
      
      <main className={styles.main}>
      
        <div className={styles.textWrapper}>
          <h1 className={styles.heading}>Welcome to Veracity</h1>
          <p className={styles.subheading}>Navigate informations with clarity and confidence guided by a 💬 conversational assistant.</p>
          <p>Log in or sign up to verify information and build trust with those you share it with.</p>
        </div>
        <div className="center" >
            <LoginButton />
          </div>

      </main>

      </div>
  );
}
