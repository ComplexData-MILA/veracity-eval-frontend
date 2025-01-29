import styles from "./page.module.scss"
import ClusterTile from "./panels/cluster";
import Distribution from "./panels/distribution";
import ReliabilityMatrix from "./panels/reliabilityMatrix";
import ReliabilityOverTime from "./panels/reliabilityTime";
import TotalsTile from "./panels/totals";
import WordCloud from "./panels/wordCloud";


export default function Dashboard() {
  return (
    <>
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Integrating data from somewhen in spacetime</p>
          </div>
          <div className={styles.topRowRight}>
            <label>Timeframe</label>
            <select>
              <option>All time</option>
              </select>
          </div>
        </div>
        <section className={styles.tileGrid}>
          <ClusterTile />
          <TotalsTile />
          <ReliabilityOverTime />
          <ReliabilityMatrix />
          <Distribution />
          <WordCloud />
        </section>
      </>
  );
}