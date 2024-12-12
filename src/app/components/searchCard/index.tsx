import styles from "./searchCard.module.scss";


const searchTerm = "price of oil June 2008"

export default function SearchCard() {

  return (
    <div className={styles.sourceCard}>
          <p className={styles.searchHeading}> SEARCH: </p>
          <p className={styles.searchContent}>{searchTerm}</p>
          <p className={styles.summaryHeading}>SUMMARY: </p>
          <p className={styles.summaryContent}>The statement simplistically attributes the high prices in June 2008 and March 2022 directly to price gouging by oil companies without considering the complexities surrounding global oil prices, including major geopolitical events and supply-demand dynamics. While the prices were indeed high in both periods, attributing these solely to price gouging without further evidence oversimplifies the issue. False statement.</p>
    </div>
  );
}