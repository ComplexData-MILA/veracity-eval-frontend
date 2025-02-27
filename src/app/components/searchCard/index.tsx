import styles from "./searchCard.module.scss";
import { useTranslations } from "next-intl";

type Props = {
  prompt: string;
  summary: string;
  number: number;
}

export default function SearchCard(props:Props) {

  const t = useTranslations('searchSummaries'); 

  return (
    <div className={styles.sourceCard}>
      <p className={styles.sourceNumberLine}><span className={styles.sourceNumberBlock}>Prompt {props.number}</span></p>
          <p className={styles.searchHeading}>{t('search')} </p>
          <p className={styles.searchContent}>{props.prompt}</p>
          <p className={styles.summaryHeading}>{t('summary')}</p>
          <p className={styles.summaryContent}>{props.summary}</p>
    </div>
  );
}