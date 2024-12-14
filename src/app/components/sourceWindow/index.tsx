"use client"
import styles from "../../chat/page.module.scss";
import SearchCard from "../searchCard";
import SourceCard from "../sourceCard";

type Props = {
  sourceWindow: number;
  isLoadingSources: boolean;
  setSourceWindow: (arg0: number) => void;
}

export default function SourceWindow({ sourceWindow, setSourceWindow, isLoadingSources }: Props) {

  if (sourceWindow===1){
  return (
    <section className={styles.sourceInspectColumn}>
          <div className={styles.controlRow}>
            <h2 className={styles.sourceHeading}>Sources</h2>
            <p className={styles.exit} onClick={()=> setSourceWindow(0)}>&times;</p>
          </div>
          {isLoadingSources? <p>loading...</p>: 
          <>
          <SourceCard />
          <SourceCard />
          <SourceCard />
          </>
          }
        </section>
  );
  }
  else {
    if (sourceWindow === 2){
    return (
      <section className={styles.sourceInspectColumn}>
        <div className={styles.controlRow}>
          <h2 className={styles.sourceHeading}>Prompt Interpretation</h2>
          <p className={styles.exit} onClick={()=> setSourceWindow(0)}>&times;</p>
        </div>
      <SearchCard />
      <SearchCard />
      <SearchCard />
    </section>
    );
    }
    else {
      return (
        <></>
      );
    }
  }
}