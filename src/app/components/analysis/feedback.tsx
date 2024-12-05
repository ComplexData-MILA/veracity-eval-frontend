"use client"
import styles from "./analysis.module.scss";
import Image from "next/image";


export default function Feedback() {

  return (
    <div className={styles.feedbackWrapper}>
        <p>Give us feedback on this answer</p>
        <Image className={styles.feedbackThumb} src="/assets/thumbUp.svg" alt="me" width="20" height="20" onClick={()=> alert("yay!")} />
        <Image className={styles.feedbackThumb} src="/assets/thumbDown.svg" alt="me" width="20" height="20" onClick={()=> alert("boo!")} />
    </div>
  );
}