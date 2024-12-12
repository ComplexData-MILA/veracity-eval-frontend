"use client"
import styles from "../analysis.module.scss";
import BarGraph from "./barGraph";

type Props = {
  setSourceWindow: (arg0: number) => void;
};

export default function Sources({ setSourceWindow }: Props) {

  return (
      <div className={styles.sources}>
        <h4 className={styles.heading}>Sources</h4>
        <p className={styles.subheading}>Indicates how confident we are in its reliability.</p>
        <BarGraph />
        <div className={styles.sourceSummary}>
          <p>Source 1 indicates gremlins in the Kremlin. It is unadvisable to accept the premise of this argument at face value.</p>
          <p className={styles.readMore} onClick={()=> setSourceWindow(1)}>Show all sources</p>
        </div>
      </div>
  );
}