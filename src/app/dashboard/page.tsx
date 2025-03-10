"use client";

import styles from "./page.module.scss"
import ClusterTile from "./panels/cluster";
import Distribution from "./panels/distribution";
import ReliabilityMatrix from "./panels/reliabilityMatrix";
import ReliabilityOverTime from "./panels/reliabilityTime";
import TotalsTile from "./panels/totals";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; 

const WordCloud = dynamic(() => import("./panels/wordCloud"), {
  ssr: false, // Prevents loading on the server
});


export default function Dashboard() {
  const defaultStartDate = new Date(2025, 0, 1); 
  const defaultEndDate = new Date(); 

  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);

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
              <div className={styles.dateRangePicker}>
                <label>Start Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Select start date"
                  className={styles.datePickerInput}
                />

                <label>End Date:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined} 
                  placeholderText="Select end date"
                  className={styles.datePickerInput}
                />
              </div>
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
          <WordCloud startDate={startDate} endDate={endDate} />
        </section>
      </>
  );
}