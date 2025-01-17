"use client"
import { useRef, useState } from "react";
import styles from "./analysis.module.scss";
import Image from "next/image";
import Link from "next/link";
import LabelButton from "./labelButton";
import { useAuthApi } from "@/app/hooks/useAuthApi";


const API_URL = 'https://api.veri-fact.ai';

type Props = {
  setSourceWindow: (arg0: number) => void;
  claimId: string | null;
};

export default function Feedback({ setSourceWindow, claimId }: Props) {

  /*This is the user rating, all other states depend on it*/
  const [voteSignal, setVoteSignal] = useState(0);
  const { fetchWithAuth } = useAuthApi();
  /*active labels, see legend at https://docs.google.com/spreadsheets/d/1gua6KaRL09oHEku6AUnK-auvQLbtW4eMWUNX1ZTr0wU/ */
  const initArray:boolean[]=Array(18).fill(false)
  const [activeLabels, setActiveLabels] = useState(initArray);
  /*UI drawer states*/
  const [feedbackIsOpen, setfeedbackIsOpen] = useState(false);
  const [feedbackIsSubmitted, setfeedbackIsSubmitted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState<string>("");


  function vote(voteInput: number){
    setVoteSignal(voteInput);
    setfeedbackIsOpen(true);
    setTimeout(() => drawerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  function handleLabelToggle(index: number){
    const tempArr = [...activeLabels];
    tempArr[index] = !tempArr[index];
    setActiveLabels(tempArr);
  }

  const handleChange = (newText: string) => {
    setInputText(newText)
  }

  function cancel(){
    setVoteSignal(0);
    setInputText("");
    setActiveLabels(Array(18).fill(false));
    setfeedbackIsOpen(false);
  }

  function submit(){
    setfeedbackIsOpen(false);
  try {
   fetchWithAuth(`${API_URL}/v1/feedback/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        "analysis_id": claimId,
        "rating": voteSignal,
        "comment": inputText,
        "labels": activeLabels.flatMap((bool, index) => bool ? index : [])
      })
    });
  } catch (error) {
    console.log(error);
  }
  setfeedbackIsSubmitted(true);
  }
  

  /*Functions returning chunks of JSX depending on voteSignal*/
  function fillStars(voteSignal:number){
    const starArray=[];
    for (let i=0;i<voteSignal;i++){
      starArray[i]=<Image className={styles.feedbackThumb} src="/assets/starFull.svg" alt="me" width="20" height="20" onClick={()=> vote(i+1)} key={i}/>
    }
    for (let i=voteSignal;i<5;i++){
      starArray[i]=<Image className={styles.feedbackThumb} src="/assets/starEmpty.svg" alt="me" width="20" height="20" onClick={()=> vote(i+1)} key={i}/>
    }
    return (
      <>
      {starArray}
      </>
    );
  }

  function fillButtons(voteSignal:number, activeLabels:boolean[]){
    let buttonArray=[];
    if (voteSignal>0&&voteSignal<3){
      buttonArray=[
      <LabelButton text="Lack of credible sources" id={1} key={1} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
      <LabelButton text="Score contradicts my understanding" id={2} key={2} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
      <LabelButton text="Explanation is too vague" id={3} key={3} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
      <LabelButton text="Evidence is unclear or incomplete" id={4} key={4} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
      <LabelButton text="Key details are missing" id={5} key={5} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
      <LabelButton text="Design or Functionality" id={6} key={6} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
      <LabelButton text="Other" id={0} key={0} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>]
    }
    else if (voteSignal===3){
      buttonArray=[
        <LabelButton text="Some sources are unclear" id={7} key={7} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Score is partially justified" id={8} key={8} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Explanation lacks detail" id={9} key={9} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Mixed or inconsistent information" id={10} key={10} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Key details are missing" id={11} key={11} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Design or Functionality" id={12} key={12} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Other" id={0} key={0} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>]
    }
    else if (voteSignal>3&&voteSignal<=5){
      buttonArray=[
        <LabelButton text="Sources are credible and reliable" id={13} key={13} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Score is clear and justified" id={14} key={14} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Explanation is well-supported" id={15} key={15} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Aligns with my understanding" id={16} key={16} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Key details are included" id={17} key={17} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Design or Functionality" id={18} key={18} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>,
        <LabelButton text="Other" id={0} key={0} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle}/>]
    }
    else buttonArray =[<p key={1000}>array out of bounds exception</p>]
    return (
      <div className={styles.labelSectionWrapper}>
      {buttonArray}
      </div>
    );
  }


  const drawer = 
    (<div className={styles.feedbackDrawer}>
        <h4 className={styles.feedbackDrawerHeading}>Why did you select this feedback?</h4>
        {fillButtons(voteSignal, activeLabels)}
        <input className={styles.feedbackTextInput}  placeholder={voteSignal < 4 ?"What was unsatisfying about this response? (Optional)" : "What was satisfying about this response? (Optional)"} onChange={(e) => handleChange(e.target.value)} value={inputText} />
        <div className={styles.bottomRow}>
          <p className={styles.feedbackDisclaimer}>Veracity my use account and system data to understand your feedback and improve our quality, You can read more details in our <Link className={styles.privacyLink} href="/privacy">Privacy Policy & Terms of service.</Link></p>
          <button className={styles.cancelButton} onClick={()=> cancel()}>Cancel</button>
          <button className={styles.submitButton} onClick={()=> submit()} disabled={activeLabels.every((val) => !Boolean(val))}>Submit</button>
        </div>
      </div>);

  return (
    feedbackIsSubmitted === true ? <p className={styles.thanksWrapper}><span className={styles.thanks}>Thank you for your feedback</span></p> :
    <section>
      <div className={styles.feedbackRow}>
        <div className={styles.feedbackWrapper}>
            <p className={styles.convinceText}>How convincing is our presented analysis for this claim?</p>
            {fillStars(voteSignal)}
        </div>
        <p className={styles.interpretedLink} onClick={()=> setSourceWindow(2)}>How Veracity interpreted your prompt</p>
      </div>
      {feedbackIsOpen ? drawer : <></>}
      <div ref={drawerRef} />
    </section>
  );
}
