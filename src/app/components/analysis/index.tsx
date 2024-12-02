"use client"
import styles from "./analysis.module.scss";


export default function Analysis() {

  return (
    <section className={styles.analysis}>
      <div className={styles.score}>
        <h4>Reliability score</h4>
      </div>
      <div className={styles.sources}>
        <h4>Sources</h4>
      </div>
    </section>
  );
}