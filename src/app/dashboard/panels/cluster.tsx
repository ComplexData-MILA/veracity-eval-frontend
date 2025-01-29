import styles from "../page.module.scss"

export default function ClusterTile() {
    return (
         <div className={styles.mockTile}>
            <h2 className={styles.title}>Similarity cluster analysis</h2>
            <p className={styles.subtitle}>Cluster analysis identifies patterns using embeddings for similarity grouping.</p>
        </div>
);
}