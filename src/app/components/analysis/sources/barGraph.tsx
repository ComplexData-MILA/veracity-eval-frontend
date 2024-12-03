"use client"
import styles from "../analysis.module.scss";


export default function BarGraph() {

  return (
      <div className={styles.sourceCredibilityRow}>
        <h2 className={styles.valueHeadingOne}>25</h2>
        <div>
          <p className={styles.averageText}>Avg. Source Credibility</p>
          <hr />
        </div>
        <h2>100%</h2>
      </div>
  );
}