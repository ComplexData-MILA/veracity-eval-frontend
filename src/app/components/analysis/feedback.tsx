"use client"
import { useRef, useState } from "react";
import styles from "./analysis.module.scss";
import Image from "next/image";
import Link from "next/link";
import LabelButton from "./labelButton";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useTranslations } from "next-intl";
import { API_URL} from "@/app/constants";

type Props = {
  claimId: string | null;
};

export default function Feedback({claimId }: Props) {
  const t = useTranslations('chatpage');
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

  const t2 = useTranslations('feedback'); 

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
    if (voteSignal > 0 && voteSignal < 3) {
      buttonArray = [
        <LabelButton text={t2('lackCredibleSources')} id={1} key={1} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('scoreContradictsUnderstanding')} id={2} key={2} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('explanationTooVague')} id={3} key={3} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('evidenceUnclearIncomplete')} id={4} key={4} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('keyDetailsMissing')} id={5} key={5} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('designFunctionality')} id={6} key={6} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('other')} id={0} key={0} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
      ];
    } else if (voteSignal === 3) {
      buttonArray = [
        <LabelButton text={t2('someSourcesUnclear')} id={7} key={7} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('scorePartiallyJustified')} id={8} key={8} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('explanationLacksDetail')} id={9} key={9} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('mixedInconsistentEvidence')} id={10} key={10} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('keyDetailsMissing')} id={11} key={11} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('designFunctionality')} id={12} key={12} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('other')} id={0} key={0} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
      ];
    } else if (voteSignal > 3 && voteSignal <= 5) {
      buttonArray = [
        <LabelButton text={t2('sourcesCredibleReliable')} id={13} key={13} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('scoreClearJustified')} id={14} key={14} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('explanationWellSupported')} id={15} key={15} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('evidenceClearUnderstandable')} id={16} key={16} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('keyDetailsIncluded')} id={17} key={17} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('designFunctionality')} id={18} key={18} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
        <LabelButton text={t2('other')} id={0} key={0} activeLabels={activeLabels} handleLabelToggle={handleLabelToggle} />,
      ];
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
        <h4 className={styles.feedbackDrawerHeading}>{t2('feedbackHeading')}</h4>
        {fillButtons(voteSignal, activeLabels)}
        <input
            className={styles.feedbackTextInput}
            placeholder={voteSignal < 4 ? t2('unsatisfiedPlaceholder') : t2('satisfiedPlaceholder')}
            onChange={(e) => handleChange(e.target.value)}
            value={inputText}
        />
        <div className={styles.bottomRow}>
            <p className={styles.feedbackDisclaimer}>
                {t2('feedbackDisclaimer')} 
                <Link className={styles.privacyLink} href="/privacy" target="_blank" rel="noopener noreferrer">
                    {t2('privacyPolicy')}
                </Link>
            </p>
            <button className={styles.cancelButton} onClick={() => cancel()}>{t2('cancel')}</button>
            <button className={styles.submitButton} onClick={() => submit()} disabled={activeLabels.every((val) => !Boolean(val))}>
                {t2('submit')}
            </button>
        </div>
      </div>);

  return (
    feedbackIsSubmitted === true ? <p className={styles.thanksWrapper}><span className={styles.thanks}>{t2('thanks')}</span></p> :
    <section>
      <div className={styles.feedbackRow}>
        <div className={styles.feedbackWrapper}>
            <p className={styles.convinceText}>{t('convincing')}</p>
            {fillStars(voteSignal)}
        </div>
      </div>
      {feedbackIsOpen ? drawer : <></>}
      <div ref={drawerRef} />
    </section>
  );
}
