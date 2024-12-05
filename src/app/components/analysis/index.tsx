"use client"
import styles from "./analysis.module.scss";
import Feedback from "./feedback";
import Score from "./score";
import Sources from "./sources";


export default function Analysis() {

  return (
    <>
    <section className={styles.analysis}>
      <Score />
      <Sources />
    </section>
    <Feedback />
    </>
  );
}