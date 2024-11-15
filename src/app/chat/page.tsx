import LoginButton from "../components/login";
import styles from "./page.module.scss";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <LoginButton />
      <div className={styles.inputWrapper}>
        <input className={styles.input} placeholder="Enter the claim you want to verify" />
        <button className={styles.submit}>Send</button>
      </div>
      </main>
      <footer className={styles.footer}>
 
      </footer>
    </div>
  );
}
