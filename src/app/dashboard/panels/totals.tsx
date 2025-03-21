import styles from "../page.module.scss"

export default function TotalsTile() {
    return (
         <div className={styles.totalTile}>
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
                    Since this table has to order, filter, expand etc (did not notice this on first glance) I would use a third party component here, save yourself a bunch of dev time. It has been done a million times and we probably do not need to reinvent the wheel.
                </p>
            </div>
        </div>

);
}