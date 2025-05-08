"use client"
import Link from "next/link";
import styles from "../analysis.module.scss";
import Donut from "./donut";
import Image from "next/image";
import { useTranslations } from "next-intl";


type Props = {
  veracityScore: number;
  text: string;
  setActiveModal: (arg0: number) => void;
};

export default function Score({veracityScore, text, setActiveModal}: Props) {
  const t = useTranslations('chatpage');
  const reliability:number = veracityScore*100

  function getColour(reliability: number) {
    if (reliability>60){return "#0CB950"}
    else {return "#1683FF"}
  }

  return (
      <section className={styles.score}>
        <div className={styles.scoreHeader}>
          <div>
            <h4 className={styles.heading}>{t('reliabilityScore')}
            <Image src="/assets/infoBw.svg" alt="info" width="18" height="18" 
          style={{cursor:'pointer'}}
          onClick={()=> setActiveModal(100)} />
            </h4>
            <Link href="/how-the-ai-works" className={styles.how} target="_blank" rel="noopener noreferrer">{t('howCalculated')}</Link>
          </div>
        </div>
        <div className={styles.scoreMain} >
          <Donut reliability={reliability} colour={getColour(reliability)} />
          <div className={styles.scoreText}>
            <p className={styles.reliabilitySummary}>{text}</p>
          </div>
        </div>
      </section>
  );
}