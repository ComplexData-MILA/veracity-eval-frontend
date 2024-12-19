"use client"
import styles from "../analysis.module.scss";

const data = 59

type Props = {
  numberOfSources: number;
  averageScore: number;
};

export default function BarGraph({ numberOfSources, averageScore }: Props) {

  return (
      <div className={styles.sourceCredibilityRow}>
        <div className={styles.credibilityRatingWrapper}>
        <h2 className={styles.valueHeadingOne}>{numberOfSources}</h2>
        <p className={styles.subheading}>Sources</p>
        </div>
        <div>
          <p className={styles.averageText}>Avg. Source Credibility</p>
          <div className={styles.backgroundBar} />
          <div className={styles.foregroundBar} style={{width:`${averageScore}%`}} />
        </div>
        <h2>{`${averageScore}%`}</h2>
      </div>
  );
}