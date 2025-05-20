"use client"
import styles from "../analysis.module.scss";

type Props = {
  text: string;
};

export default function Score({text}: Props) {

  return (
      <section className={styles.score}>
        <div className={styles.scoreMain} >
            <p className={styles.reliabilitySummary}>{text}</p>
        </div>
      </section>
  );
}