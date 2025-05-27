"use client"
import { FinalAnalysis } from "@/app/types";
import styles from "./analysis.module.scss";
import Score from "./score";
import { useState } from "react";
import ScoreInfo from "../modals/info/scoreInfo";

type Props = {
  finalAnalysis: FinalAnalysis
};



export default function Analysis({finalAnalysis}: Props) {

  const [activeModal, setActiveModal] = useState(0)

  return (
    <>
    <section className={styles.analysis}>
      <Score veracityScore={finalAnalysis.veracity_score} text={finalAnalysis.analysis_text} setActiveModal={setActiveModal}/>
      {activeModal === 100 ? <ScoreInfo setActiveModal={setActiveModal} /> : <></>}
    </section>
    </>
  );
}