import styles from "./sourceCard.module.scss";

export default function SourceCard() {

  return (
    <div className={styles.sourceCardWrapper}>
      <div className={styles.topText}>
        <p><span className={styles.sourceNumberBlock}>Source X</span> mentions the Kremlin saying the strike was designed to warn the the Kremlin saying the strike was strike was designed to warn.</p>
      </div>
      <div className={styles.sourceCard}>
          <p className={styles.sourceNumberParagraph}><span className={styles.sourceColorBlock}>Credibility: 50%</span></p>
          <h3 className={styles.sourceHeading}>Russia-Ukraine war live: real risk of escalating war turning into ...</h3>
          <p className={styles.sourcesDescription}>15 hours ago - missiles they have supplied to Ukraine to be used to strike targets in Russia. In a televised address, Putin said: We consider ourselves ...</p>
          <p className={styles.sourceName}>The Guardian</p>
      </div>
    </div>
  );
}