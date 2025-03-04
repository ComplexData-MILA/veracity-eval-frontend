"use client"
import { Source, Search } from "@/app/types";
import Image from "next/image";
import styles from "../../chat/page.module.scss";
import SearchCard from "../searchCard";
import SourceCard from "../sourceCard";
import { useState } from "react";
import SearchSummariesModal from "../modals/info/searchSummaries";
import { useTranslations } from "next-intl";

type Props = {
  sourceWindow: number;
  isLoadingSources: boolean;
  setSourceWindow: (arg0: number) => void;
  sources: Source[];
  searches: Search[];
}

export default function SourceWindow({ sourceWindow, setSourceWindow, isLoadingSources, sources, searches }: Props) {
  const t = useTranslations('searchSummaries'); 

  const sourceData = sources.map((source, index) =>
  <SourceCard title={source.title} snippet={source.snippet} number={index+1} url={source.url} key={source.id} credibility_score={source.credibility_score} />
  );

  const searchData = searches.map((search, index) =>
  <SearchCard number={index+1} prompt={search.prompt} summary={search.summary} key={index}  />
  );

  const [activeModal, setActiveModal] = useState(0)

  if (sourceWindow===1){
  return (
    <section className={styles.sourceInspectColumn}>
          <div className={styles.controlRow}>
            <h2 className={styles.sourceHeading}>{t('altTitle')}</h2>
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
          <h2 className={styles.sourceHeading} onClick={()=> setActiveModal(10)}>{t('title')}
          <Image src="/assets/infoBw.svg" alt="info" width="18" height="18" 
          style={{cursor:'pointer'}}
          onClick={()=> setActiveModal(10)} />
          </h2>
          <p className={styles.exit} onClick={()=> setSourceWindow(0)}>&times;</p>
        </div>
      {searchData}
      {activeModal !== 0 ? <SearchSummariesModal setActiveModal={setActiveModal} /> : <></>}
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