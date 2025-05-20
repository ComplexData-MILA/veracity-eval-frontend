"use client"
import styles from "../analysis.module.scss";
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
        <div className={styles.scoreMain} >
            <p className={styles.reliabilitySummary}>{text}</p>
        </div>
      </section>
  );
}