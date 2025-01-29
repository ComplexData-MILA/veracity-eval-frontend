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
                <div className={styles.topRowBottomTile}>
                    <div className={styles.lhs}>
                        <h2 className={styles.title}>Retrieved Sources</h2>
                        <p className={styles.subtitle}>Information obtained from a query</p>
                    </div>
                    <div className={styles.rhs}>
                        <h2 className={styles.subtitle}>Total sources used in reliability score</h2>
                        <h3 className={styles.giantNumber}>2350</h3>
                    </div>
                </div>
                <p className={styles.note}>
                    Since this table has to order, filter, expand etc I'd use a third party component here, save yourself a bunch of dev time. It's been done a million times and we probably don't need to reinvent the wheel.
                </p>
            </div>
        </div>

);
}