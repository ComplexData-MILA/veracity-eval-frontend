import styles from "./searchCard.module.scss";

type Props = {
  prompt: string;
  summary: string;
  number: number;
}

export default function SearchCard(props:Props) {

  return (
    <div className={styles.sourceCard}>
      <p className={styles.sourceNumberLine}><span className={styles.sourceNumberBlock}>Source {props.number}</span></p>
          <p className={styles.searchHeading}> SEARCH: </p>
          <p className={styles.searchContent}>{props.prompt}</p>
          <p className={styles.summaryHeading}>SUMMARY: </p>
          <p className={styles.summaryContent}>{props.summary}</p>
    </div>
  );
}