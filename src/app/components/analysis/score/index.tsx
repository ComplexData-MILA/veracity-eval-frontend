"use client"
import styles from "../analysis.module.scss";


export default function Score() {

  return (
      <div className={styles.score}>
        <h4 className={styles.heading}>Reliability score</h4>
        <p className={styles.subheading}>Based on word analysis from verified sources.</p>
      </div>
  );
}