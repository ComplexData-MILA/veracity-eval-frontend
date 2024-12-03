"use client"
import styles from "../analysis.module.scss";


export default function Score() {

  return (
      <section className={styles.score}>
        <div className={styles.scoreHeader}>
          <div>
            <h4 className={styles.heading}>Reliability score</h4>
            <p className={styles.subheading}>Based on word analysis from verified sources.</p>
          </div>
          <p className={styles.subheading}>How Veracity interpreted your prompt</p>
        </div>
        <div className={styles.scoreMain} >
          <div className={styles.scoreGraph}>

          </div>
          <div className={styles.scoreText}>

          </div>
        </div>
      </section>
  );
}