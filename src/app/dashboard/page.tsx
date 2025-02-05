import styles from "./page.module.scss"
import ClusterTile from "./panels/cluster";
import Distribution from "./panels/distribution";
import ReliabilityMatrix from "./panels/reliabilityMatrix";
import ReliabilityOverTime from "./panels/reliabilityTime";
import TotalsTile from "./panels/totals";
import WordCloud from "./panels/wordCloud";
import Image from "next/image";


export default function Dashboard() {
  return (
    <>
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Integrating data from somewhen in spacetime</p>
          </div>
          
        </div>
        <section className={styles.tileGrid}>
              <div className={styles.selectorRowLeft}>
              <div>
                <label className={styles.timeframeTitle}>Timeframe</label>
                <p className={styles.timeframeSubtitle}>Set a timeframe to update the dashboard</p>
              </div>
              <select className={styles.timeframeSelector}>
                <option>All time</option>
                <option>1 month</option>
                <option>etc</option>
                <option>etc...</option>
                </select>
              </div>
              <div className={styles.selectorRowRight}>
                <div className={styles.logoRow}>
                <p className={styles.logoText}>Powered by</p>
                {/*Put more logos here instead of these divs */}
                <div /><div />
                {/*new high quality ones probably */}
                <Image src="/assets/mila.png" alt="me" width="116" height="41" className={styles.mila}/>
                <Image src="/assets/udem.png" alt="me" width="100" height="41" />
                <Image src="/assets/mcgillBlack.png" alt="me" width="116" height="30" />
                </div>
            </div>
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