"use client"
import { FinalAnalysis, Source } from "@/app/types";
import styles from "./analysis.module.scss";
import Feedback from "./feedback";
import Score from "./score";
import Sources from "./sources";
import { useState } from "react";
import SourcesInfo from "../modals/info/sourcesInfo";
import ScoreInfo from "../modals/info/scoreInfo";

type Props = {
  setSourceWindow: (arg0: number) => void;
  finalAnalysis: FinalAnalysis
  sources: Source[]
  claimId: string | null;
};



export default function Analysis({ setSourceWindow, finalAnalysis, sources, claimId }: Props) {

  const [activeModal, setActiveModal] = useState(0)

  return (
    <>
    <section className={styles.analysis}>
      <Score veracityScore={finalAnalysis.veracity_score} text={finalAnalysis.analysis_text} setActiveModal={setActiveModal}/>
      <Sources setSourceWindow={setSourceWindow} sources={sources} setActiveModal={setActiveModal}  />
      {activeModal === 100 ? <ScoreInfo setActiveModal={setActiveModal} /> : <></>}
      {activeModal === 101 ? <SourcesInfo setActiveModal={setActiveModal} /> : <></>}
    </section>
    <Feedback setSourceWindow={setSourceWindow} claimId={claimId} />
    </>
  );
}