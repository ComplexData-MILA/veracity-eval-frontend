"use client"

import styles from "../../chat/page.module.scss";
import SourceCard from "../sourceCard";



export default function SourceWindow() {

  return (
    <section className={styles.sourceInspectColumn}>
          <h2 className={styles.sourceHeading}>Prompt Interpretation</h2>
          <SourceCard />
          <SourceCard />
          <SourceCard />
        </section>
  );
}