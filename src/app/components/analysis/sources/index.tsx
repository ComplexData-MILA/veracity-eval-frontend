"use client"
import styles from "../analysis.module.scss";
import BarGraph from "./barGraph";


export default function Sources() {

  return (
      <div className={styles.sources}>
        <h4 className={styles.heading}>Sources</h4>
        <p className={styles.subheading}>Indicates how confident we are in its reliability.</p>
        <BarGraph />
        <div className={styles.sourceSummary}>
          <p>Source 1 indicates gremlins in the Kremlin. It's unadvisable to accept the premise of this argument at face value.</p>
          <p className={styles.readMore}>Read more...</p>
        </div>
      </div>
  );
}