import styles from "./page.module.scss"


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
          <div className={styles.mockTile} />
          <div className={styles.mockTile} />
          <div className={styles.mockTile} />
          <div className={styles.mockTile} />
          <div className={styles.mockTile} />
          <div className={styles.mockTile} />
        </section>
      </>
  );
}