"use client"
import styles from "../analysis.module.scss";
import Donut from "./donut";
import { useTranslations } from "next-intl";
import React from "react";


type Props = {
  veracityScore: number;
  text: string;
};

export default function Score({veracityScore, text}: Props) {
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
            </h4>
          </div>
        </div>
        <div className={styles.scoreMain} >

          <Donut reliability={reliability} colour={getColour(reliability)} />
          <div className={styles.scoreText}>
            <p className={styles.reliabilitySummary}>{text}</p>
          </div>
            <p className={styles.reliabilitySummary}>
              {typeof text === "string" && text.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
        </div>
      </section>
  );
}