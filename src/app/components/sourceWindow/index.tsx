"use client"
import { Source } from "@/app/types";
import styles from "../../chat/page.module.scss";
import SearchCard from "../searchCard";
import SourceCard from "../sourceCard";

type Props = {
  sourceWindow: number;
  isLoadingSources: boolean;
  setSourceWindow: (arg0: number) => void;
  sources: Source[]
}

export default function SourceWindow({ sourceWindow, setSourceWindow, isLoadingSources, sources }: Props) {

  const sourceData = sources.map((source, index) =>
  <SourceCard title={source.title} snippet={source.snippet} number={index+1} key={source.id} />
  );

  if (sourceWindow===1){
  return (
    <section className={styles.sourceInspectColumn}>
          <div className={styles.controlRow}>
            <h2 className={styles.sourceHeading}>Sources</h2>
            <p className={styles.exit} onClick={()=> setSourceWindow(0)}>&times;</p>
          </div>
          {isLoadingSources? <p>loading...</p>: 
          <>
          {sourceData}
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