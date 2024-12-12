"use client"
import { useState } from "react";
import styles from "./analysis.module.scss";
import Image from "next/image";

type Props = {
  setSourceWindow: (arg0: number) => void;
};

export default function Feedback({ setSourceWindow }: Props) {

  const [feedbacklIsOpen, setfeedbacklIsOpen] = useState(false)
  const [voteSignal, setVoteSignal] = useState(0)

  function vote(voteSignal: number){
    setVoteSignal(voteSignal)
    setfeedbacklIsOpen(true)
  }
  const drawer = 
    (<div className={styles.feedbackDrawer}>
        <h4 className={styles.feedbackDrawerHeading}>Why did you select this feedback?</h4>
        <textarea className={styles.feedbackTextInput} placeholder="What was unsatisfying about this response?" />
        <div className={styles.bottomRow}>
          <p className={styles.feedbackDisclaimer}>Veracity my use account and system data to understand your feedback and improve our quality,You can read more into details in Privacy Policy and Terms of service.</p>
          <button className={styles.cancelButton} onClick={()=> setfeedbacklIsOpen(false)}>Cancel</button>
          <button className={styles.submitButton} onClick={()=> setfeedbacklIsOpen(false)}>Submit</button>
        </div>
      </div>);

  return (
    <section>
      <div className={styles.feedbackRow}>
        <div className={styles.feedbackWrapper}>
            <p>Give us feedback on this answer</p>
            <Image className={styles.feedbackThumb} src="/assets/thumbUp.svg" alt="me" width="20" height="20" onClick={()=> vote(1)} />
            <Image className={styles.feedbackThumb} src="/assets/thumbDown.svg" alt="me" width="20" height="20" onClick={()=> vote(-1)} />
            <p>{voteSignal}</p>
        </div>
        <p className={styles.interpretedLink} onClick={()=> setSourceWindow(2)}>How Veracity interpreted your prompt</p>
      </div>
      {feedbacklIsOpen ? drawer : <></>}
    </section>
  );
}