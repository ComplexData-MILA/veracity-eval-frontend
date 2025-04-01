"use client";

import styles from "./page.module.scss"
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; 

import { useLocale } from 'next-intl';
import LangSwitcherHome from "../components/langSelect/homepage";

const WordCloud = dynamic(() => import("./panels/wordCloud"), {
  ssr: false, // Prevents loading on the server
});
const ClusterTile = dynamic(() => import("./panels/cluster"), { ssr: false });
const AggregateTile = dynamic(() => import("./panels/aggregate"), { ssr: false });
const TotalsTile = dynamic(() => import("./panels/totals"), { ssr: false });

export default function Dashboard() {
  const defaultStartDate = new Date(2025, 0, 1); 
  const defaultEndDate = new Date(2025, 2, 1); 

  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);

  const locale = useLocale();
  
  useEffect(() => {
    setEndDate(new Date()); // Ensures it only runs on the client
  }, []);
  return (
    <>
      <div className={styles.headerRow}>
      <div className={styles.languageSelect}>{locale === "fr" ? <LangSwitcherHome lang="en" /> : <LangSwitcherHome lang="fr" />}</div> </div>
        <div className={styles.topRow}>
          <div className={styles.topRowLeft}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Integrating data up to today</p>
          </div>
          <div className={styles.topRowRight}>
              <div className={styles.logoRow}>
              <p className={styles.logoText}>Powered by</p>
              <Image src="/assets/mila.png" alt="me" width="116" height="41" className={styles.mila}/>
              <Image src="/assets/udem.png" alt="me" width="100" height="41" />
              <Image src="/assets/mcgillBlack.png" alt="me" width="116" height="30" />
              </div>
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
                <AggregateTile startDate={startDate} endDate={endDate} language={locale === "fr" ? "french": "english"} />
              </div>
          <ClusterTile startDate={startDate} endDate={endDate} language={locale === "fr" ? "french": "english"} />
          <TotalsTile startDate={startDate} endDate={endDate} language={locale === "fr" ? "french": "english"} />
          {/* <ReliabilityOverTime /> */}
          {/* <ReliabilityMatrix /> */}
          {/* <Distribution /> */}
          <WordCloud startDate={startDate} endDate={endDate} language={locale === "fr" ? "french": "english"} />
        </section>
      </>
  );
}