import styles from "./sourceCard.module.scss";

type Props = {
  title: string;
  snippet: string;
  url: string;
  number: number;
  credibility_score: number;
}

export default function SourceCard(props:Props) {
  let score =""
  if (props.credibility_score === null){score="Unknown"}
  else score = `${Math.trunc(props.credibility_score*100)}%`

  return (
    <div className={styles.sourceCardWrapper}>
      <div className={styles.topText}>
        <p><span className={styles.sourceNumberBlock}>Source {props.number}</span></p>
      </div>
      <a href={props.url} target="_blank">
        <div className={styles.sourceCard}>
            <p className={styles.sourceNumberParagraph}><span className={styles.sourceColorBlock}>Credibility: {score}</span></p>
            <h3 className={styles.sourceHeading}>{props.title}</h3>
            <p className={styles.sourcesDescription}>{props.snippet}</p>
            <p className={styles.sourceName}>{props.url.length > 35 ? `${props.url.substring(0,35)}...` : props.url}</p>
        </div>
      </a>
    </div>
  );
}