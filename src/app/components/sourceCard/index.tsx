import styles from "./sourceCard.module.scss";

type Props = {
  title: string;
  snippet: string;
  url: string;
  number: number;
}

export default function SourceCard(props:Props) {

  return (
    <div className={styles.sourceCardWrapper}>
      <div className={styles.topText}>
        <p><span className={styles.sourceNumberBlock}>Source {props.number}</span></p>
      </div>
      <a href={props.url} target="_blank">
        <div className={styles.sourceCard}>
            <p className={styles.sourceNumberParagraph}><span className={styles.sourceColorBlock}>Credibility: 50%</span></p>
            <h3 className={styles.sourceHeading}>{props.title}</h3>
            <p className={styles.sourcesDescription}>{props.snippet}</p>
            <p className={styles.sourceName}>Name of source</p>
        </div>
      </a>
    </div>
  );
}