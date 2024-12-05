"use client"
import styles from "../analysis.module.scss";

const data = 90

export default function BarGraph() {

  return (
      <div className={styles.sourceCredibilityRow}>
        <div className={styles.credibilityRatingWrapper}>
        <h2 className={styles.valueHeadingOne}>25</h2>
        <p className={styles.subheading}>Sources</p>
        </div>
        <div>
          <p className={styles.averageText}>Avg. Source Credibility</p>
          <div className={styles.backgroundBar} />
          <div className={styles.foregroundBar} style={{width:`${data}%`}} />
        </div>
        <h2>{`${data}%`}</h2>
      </div>
  );
}