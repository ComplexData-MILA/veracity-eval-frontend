"use client"
import { Source, Search } from "@/app/types";
import styles from "../../chat/page.module.scss";
import SearchCard from "../searchCard";
import SourceCard from "../sourceCard";

type Props = {
  sourceWindow: number;
  isLoadingSources: boolean;
  setSourceWindow: (arg0: number) => void;
  sources: Source[];
  searches: Search[];
}

export default function SourceWindow({ sourceWindow, setSourceWindow, isLoadingSources, sources, searches }: Props) {

  const sourceData = sources.map((source, index) =>
  <SourceCard title={source.title} snippet={source.snippet} number={index+1} url={source.url} key={source.id} credibility_score={source.credibility_score} />
  );

  const searchData = searches.map((search, index) =>
  <SearchCard number={index+1} prompt={search.prompt} summary={search.summary} key={index}  />
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
          <h2 className={styles.sourceHeading}>AI Search Summaries</h2>
          <p className={styles.exit} onClick={()=> setSourceWindow(0)}>&times;</p>
        </div>
      {searchData}
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