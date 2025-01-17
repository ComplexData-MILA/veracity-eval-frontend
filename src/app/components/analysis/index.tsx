"use client"
import { FinalAnalysis, Source } from "@/app/types";
import styles from "./analysis.module.scss";
import Feedback from "./feedback";
import Score from "./score";
import Sources from "./sources";

type Props = {
  setSourceWindow: (arg0: number) => void;
  finalAnalysis: FinalAnalysis
  sources: Source[]
  claimId: string | null;
};



export default function Analysis({ setSourceWindow, finalAnalysis, sources, claimId }: Props) {

  return (
    <>
    <section className={styles.analysis}>
      <Score veracityScore={finalAnalysis.veracity_score} text={finalAnalysis.analysis_text}/>
      <Sources setSourceWindow={setSourceWindow} sources={sources}  />
    </section>
    <Feedback setSourceWindow={setSourceWindow} claimId={claimId} />
    </>
  );
}