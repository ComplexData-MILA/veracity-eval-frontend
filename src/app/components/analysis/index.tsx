"use client"
import styles from "./analysis.module.scss";
import Feedback from "./feedback";
import Score from "./score";
import Sources from "./sources";

type Props = {
  setSourceWindow: (arg0: number) => void;
};

export default function Analysis({ setSourceWindow }: Props) {

  return (
    <>
    <section className={styles.analysis}>
      <Score />
      <Sources setSourceWindow={setSourceWindow} />
    </section>
    <Feedback setSourceWindow={setSourceWindow} />
    </>
  );
}