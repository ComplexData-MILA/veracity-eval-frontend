"use client"
import { Source } from "@/app/types";
import styles from "../analysis.module.scss";
import BarGraph from "./barGraph";
import Image from "next/image";
import { useTranslations } from "next-intl";

type Props = {
  setSourceWindow: (arg0: number) => void;
  setActiveModal: (arg0: number) => void;
  sources: Source[]
};

export default function Sources({ setSourceWindow, setActiveModal, sources }: Props) {
  const t = useTranslations('chatpage');
  function averageCredibilityScore(sources: Source[]){
    let average=0;
    let nonNullSources=0;
    sources.forEach((element:Source) =>{ average+=element.credibility_score
    if (element.credibility_score!== null){
      nonNullSources=nonNullSources+1
    }}
    );
    average=(average/nonNullSources)*100;
    average=Math.trunc(average);
    return average;
  }

  return (
      <div className={styles.sources}>
        <h4 className={styles.heading}>Sources
        <Image src="/assets/infoBw.svg" alt="info" width="18" height="18" 
          style={{cursor:'pointer'}}
          onClick={()=> setActiveModal(101)} />
        </h4>
        <p className={styles.subheading}>{t('confident')}</p>
        <BarGraph numberOfSources={sources.length} averageScore={averageCredibilityScore(sources)}  />
        <div className={styles.sourceSummary}>
          <p className={styles.sourceSummaryParagraph}>Source 1: {JSON.stringify(sources[0]?.snippet)}</p>
          <p className={styles.readMore} onClick={()=> setSourceWindow(1)}>{t('showAllSources')}</p>
        </div>
      </div>
  );
}