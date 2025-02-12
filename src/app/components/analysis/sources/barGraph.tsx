"use client"
import { useTranslations } from "next-intl";
import styles from "../analysis.module.scss";

type Props = {
  numberOfSources: number;
  averageScore: number;
};

export default function BarGraph({ numberOfSources, averageScore }: Props) {
  const t = useTranslations('chatpage');
  /*this is for the average score text*/
  let override =''
  if (Number.isNaN(averageScore))
  {override="Unknown"}
  /*should the bargraph transition to green or not*/
  let backgroundGradient = ''
  if (averageScore>60){backgroundGradient=`linear-gradient(90deg, #1683FF  0%, #1683FF  40%, #11F90E 60%, #11F90E ${averageScore}%, #ffffff00 ${averageScore}%, #ffffff00 100%)`}
  else {backgroundGradient=`linear-gradient(90deg, #1683FF  0%, #1683FF  ${averageScore}%, #ffffff00 ${averageScore}%, #ffffff00 100%)`}
  return (
      <div className={styles.sourceCredibilityRow}>
        <div className={styles.credibilityRatingWrapper}>
        <h2 className={styles.valueHeadingOne}>{numberOfSources}</h2>
        <p className={styles.subheading}>Sources</p>
        </div>
        <div>
          <p className={styles.averageText}>{t('averageCredibility')}</p>
          {override.length>0?
          <h2>{override}</h2>:<>
          <div className={styles.backgroundBar} />
          <div className={styles.foregroundBar} style={{background:backgroundGradient}} /></>}
        </div>
        <h2>{override.length<1?`${averageScore}%`:''}</h2>
      </div>
  );
}