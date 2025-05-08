import styles from "./sourceCard.module.scss";
import { useTranslations } from "next-intl";

type Props = {
  title: string;
  snippet: string;
  url: string;
  number: number;
  credibility_score: number;
}

export default function SourceCard(props:Props) {
  const t = useTranslations('searchSummaries'); 

  let score =""
  if (props.credibility_score === null){score=t('NA')}
  else score = `${Math.trunc(props.credibility_score*100)}%`

  return (
    <div className={styles.sourceCardWrapper}>
      <div className={styles.topText}>
        <p><span className={styles.sourceNumberBlock}>Source {props.number}</span></p>
      </div>
      <a href={props.url} target="_blank">
        <div className={styles.sourceCard}>
            <h3 className={styles.sourceHeading}>{props.title}</h3>
            <p className={styles.sourcesDescription}>{props.snippet}</p>
            <p className={styles.sourceName}>{props.url.length > 35 ? `${props.url.substring(0,35)}...` : props.url}</p>
        </div>
      </a>
    </div>
  );
}