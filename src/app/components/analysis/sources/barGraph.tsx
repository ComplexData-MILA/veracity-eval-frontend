"use client"
import styles from "../analysis.module.scss";

type Props = {
  numberOfSources: number;
  averageScore: number;
};

export default function BarGraph({ numberOfSources, averageScore }: Props) {
  let override =''
  if (Number.isNaN(averageScore))
  {override="Unknown"}
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
        <h2>{override.length>0?`${override}`:`${averageScore}%`}</h2>
      </div>
  );
}