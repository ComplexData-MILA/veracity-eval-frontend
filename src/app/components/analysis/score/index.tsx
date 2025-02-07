"use client"
import Link from "next/link";
import styles from "../analysis.module.scss";
import Donut from "./donut";
import Image from "next/image";


type Props = {
  veracityScore: number;
  text: string;
  setActiveModal: (arg0: number) => void;
};

export default function Score({veracityScore, text, setActiveModal}: Props) {

  const reliability:number = veracityScore*100

  function getShouldYouShare(reliability:number){
    if (reliability>60){
      return "you can share with your network."
    }
    else {return "you should not share with your network."}
  }
  
  function getIsThisReliable(reliability: number) {
    if (reliability<=20){return "The claim is not reliable,"}
    else if (reliability>20&&reliability<=40){return "The claim is likely not reliable,"}
    else if (reliability>40&&reliability<=60){return "The claim needs further investigation,"}
    else if (reliability>60&&reliability<=80){return "The claim is reliable,"}
    else {return "The claim is highly reliable,"}
  }

  function getColour(reliability: number) {
    if (reliability>60){return "#0CB950"}
    else {return "#1683FF"}
  }

  const shouldYouShare = getShouldYouShare(reliability);
  const isThisReliable = getIsThisReliable(reliability);
  const textColorConst = getColour(reliability);

  return (
      <section className={styles.score}>
        <div className={styles.scoreHeader}>
          <div>
            <h4 className={styles.heading}>Reliability score
            <Image src="/assets/infoBw.svg" alt="info" width="18" height="18" 
          style={{cursor:'pointer'}}
          onClick={()=> setActiveModal(100)} />
            </h4>
            <Link href="#" className={styles.how}>How is this calculated?</Link>
          </div>
        </div>
        <div className={styles.scoreMain} >
          <Donut reliability={reliability} />
          <div className={styles.scoreText}>
            <h2 className={styles.firstHeading} style={{color: textColorConst}}>{isThisReliable}</h2>
            <h2 className={styles.secondHeading}>{shouldYouShare}</h2>
            <p className={styles.reliabilitySummary}>{text}</p>
          </div>
        </div>
      </section>
  );
}