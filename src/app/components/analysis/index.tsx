"use client"
import { FinalAnalysis } from "@/app/types";
import styles from "./analysis.module.scss";
import Feedback from "./feedback";
import Score from "./score";
import { useState } from "react";
import ScoreInfo from "../modals/info/scoreInfo";

type Props = {
  finalAnalysis: FinalAnalysis
  claimId: string | null;
};



export default function Analysis({finalAnalysis, claimId }: Props) {

  const [activeModal, setActiveModal] = useState(0)

  return (
    <>
    <section className={styles.analysis}>
      <Score veracityScore={finalAnalysis.veracity_score} text={finalAnalysis.analysis_text} setActiveModal={setActiveModal}/>
      {activeModal === 100 ? <ScoreInfo setActiveModal={setActiveModal} /> : <></>}
    </section>
    <Feedback claimId={claimId} />
    </>
  );
}