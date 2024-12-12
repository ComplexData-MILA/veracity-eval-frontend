"use client"
import Link from "next/link";
import styles from "../analysis.module.scss";
import Donut from "./donut";




export default function Score() {

  return (
      <section className={styles.score}>
        <div className={styles.scoreHeader}>
          <div>
            <h4 className={styles.heading}>Reliability score</h4>
            <Link href="#" className={styles.how}>How is this calculated?</Link>
          </div>
          
        </div>
        <div className={styles.scoreMain} >
          <Donut />
          <div className={styles.scoreText}>
            <h2 className={styles.firstHeading}>This is not reliable,</h2>
            <h2 className={styles.largeHeading}>you should not share with confidence</h2>
            <p className={styles.reliabilitySummary}>Oil prices soared to heights not seen since 2008 due to the Russia-Ukraine war, with ICE Brent oil futures sliding to around $100/bbl intraday. </p>
          </div>
        </div>
        
      </section>
  );
}