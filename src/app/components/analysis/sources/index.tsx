"use client"
import { Source } from "@/app/types";
import styles from "../analysis.module.scss";
import BarGraph from "./barGraph";

type Props = {
  setSourceWindow: (arg0: number) => void;
  sources: Source[]
};

export default function Sources({ setSourceWindow, sources }: Props) {

  function averageCredibilityScore(sources: Source[]){
    let average=0;
    sources.forEach((element:Source) => average+=element.credibility_score);
    average=(average/sources.length)*100;
    return average;
  }

  return (
      <div className={styles.sources}>
        <h4 className={styles.heading}>Sources</h4>
        <p className={styles.subheading}>Indicates how confident we are in its reliability.</p>
        <BarGraph numberOfSources={sources.length} averageScore={averageCredibilityScore(sources)}  />
        <div className={styles.sourceSummary}>
          <p className={styles.sourceSummaryParagraph}>Source 1: {JSON.stringify(sources[0]?.snippet)}</p>
          <p className={styles.readMore} onClick={()=> setSourceWindow(1)}>Show all sources</p>
        </div>
      </div>
  );
}