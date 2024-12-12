"use client"
import styles from "./analysis.module.scss";
import Image from "next/image";

type Props = {
  setSourceWindow: (arg0: number) => void;
};

export default function Feedback({ setSourceWindow }: Props) {

  return (
    <section>
      <div className={styles.feedbackRow}>
        <div className={styles.feedbackWrapper}>
            <p>Give us feedback on this answer</p>
            <Image className={styles.feedbackThumb} src="/assets/thumbUp.svg" alt="me" width="20" height="20" onClick={()=> alert("yay!")} />
            <Image className={styles.feedbackThumb} src="/assets/thumbDown.svg" alt="me" width="20" height="20" onClick={()=> alert("boo!")} />
        </div>
        <p className={styles.interpretedLink} onClick={()=> setSourceWindow(2)}>How Veracity interpreted your prompt</p>
      </div>
      <div className={styles.feedbackDrawer}>
        <h4 className={styles.feedbackDrawerHeading}>Why did you select this feedback?</h4>
        <textarea className={styles.feedbackTextInput} placeholder="what was unsatisfying about this response?" />
        <div className={styles.bottomRow}>
          <p className={styles.feedbackDisclaimer}>Veracity my use account and system data to understand your feedback and improve our quality,You can read more into details in Privacy Policy and Terms of service.</p>
          <button>Cancel</button>
          <button>Submit</button>
        </div>
      </div>
    </section>
  );
}