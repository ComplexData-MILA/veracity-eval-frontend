import styles from "../secondaryModal.module.scss";


type Props = {
  setActiveModal: (arg0: number) => void;
};


const ScoreInfo = ({ setActiveModal }: Props) => {


  return (
      <div className={styles.clearWrapper} onClick={()=> setActiveModal(0)}>
        <div className={styles.modalThree} onClick={e => e.stopPropagation()}>
          <div>
            <h4>What is a reliability score?</h4>
            <p>
              A reliability score evaluates how trustworthy a claim is. 
              It helps determine if a claim is credible or needs verification. 
              The score is based on:
            </p>
            <ul>
            <li>Evidence Quality: Strength of supporting data.</li>
            <li>Source Credibility: Reliability of the source.</li>
            <li>Consistency: Alignment with verified facts.</li>  
            <li>Bias Detection: Presence of bias.</li>
            <li>Verification: Independent reproducibility.</li>
            </ul>

            <h4>How does Veracity calculate this score?</h4>
            <p>
            Veracity calculates the score by evaluating four key factors: source credibility, evidence quality, consistency with verified facts, and potential bias.
            </p>
            <p>
            Each factor contributes to the final reliability score, measured on a 5-point scale:
            </p>
            <p>Reliability Scale: </p>
            <ul>
            <li>0-20%: The claim is not reliable</li>
            <li>21-40%: The claim is likely not reliable</li>
            <li>41-60%: The claim needs further investigation</li>  
            <li>61-80%: The claim is reliable</li>
            <li>81-100%: The claim is highly reliable.</li>
            </ul>
        </div>
        </div>
      </div>
  );
}

export default ScoreInfo;