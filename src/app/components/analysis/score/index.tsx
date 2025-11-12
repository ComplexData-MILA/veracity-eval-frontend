"use client"
import styles from "../analysis.module.scss";
import React from "react";


type Props = {
  text: string;
};

export default function Score({text}: Props) {

  return (
      <section className={styles.score}>
        <div className={styles.scoreHeader}>
        </div>
        <div className={styles.scoreMain} >

            <p className={styles.reliabilitySummary}>
              {typeof text === "string" && text.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
        </div>
      </section>
  );
}