import styles from "../page.module.scss"

export default function TotalsTile() {
    return (
         <div className={styles.totalTile}>
            <div className={styles.topTilesRow}>
                <div className={styles.topTile}>
                <h2 className={styles.title}>Total number of claims</h2>
                <h3 className={styles.giantNumber}>1359</h3>
                </div>
                <div className={styles.topTile}>
                <h2 className={styles.title}>Avg reliability score</h2>
                <h3 className={styles.giantNumber}>45%</h3>
                </div>
            </div>
            <div className={styles.bottomTile}>
            <h2 className={styles.title}>Retrieved Sources</h2>
            <p className={styles.subtitle}>Information obtained from a query</p>
            </div>
        </div>

);
}