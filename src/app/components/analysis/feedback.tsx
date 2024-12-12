"use client"
import styles from "./analysis.module.scss";
import Image from "next/image";

type Props = {
  setSourceWindow: (arg0: number) => void;
};

export default function Feedback({ setSourceWindow }: Props) {

  return (
    <div className={styles.feedbackRow}>
      <div className={styles.feedbackWrapper}>
          <p>Give us feedback on this answer</p>
          <Image className={styles.feedbackThumb} src="/assets/thumbUp.svg" alt="me" width="20" height="20" onClick={()=> alert("yay!")} />
          <Image className={styles.feedbackThumb} src="/assets/thumbDown.svg" alt="me" width="20" height="20" onClick={()=> alert("boo!")} />
      </div>
      <p className={styles.interpretedLink} onClick={()=> setSourceWindow(2)}>How Veracity interpreted your prompt</p>
    </div>
  );
}