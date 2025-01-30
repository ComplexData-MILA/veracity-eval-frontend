import styles from "../page.module.scss"


export default function WordCloud() {
    
    return (
         <div className={styles.mockTile}>
            <h2 className={styles.title}>Claim Word cloud</h2>
            <div className={styles.chartWrapper}>
                <h1>word</h1>
                <h2>cloud</h2>
                <p>goes</p>
                <h3>here</h3>
            </div>
        </div>
);
}