import styles from "./page.module.scss";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <label>Enter your claim...</label>
        <input placeholder="Enter the claim you want to verify" />
          
      </main>
      <footer className={styles.footer}>
 
      </footer>
    </div>
  );
}
