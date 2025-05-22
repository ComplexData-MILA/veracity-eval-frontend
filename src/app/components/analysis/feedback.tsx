"use client"
import { useState } from "react";
import styles from "./analysis.module.scss";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useTranslations } from "next-intl";
import { API_URL } from "@/app/constants";

type Props = {
  claimId: string | null;
};

export default function Feedback({ claimId }: Props) {
  const t = useTranslations("chatpage");
  const t2 = useTranslations("feedback");
  const { fetchWithAuth } = useAuthApi();

  const [voteSignal, setVoteSignal] = useState(5);
  const [feedbackIsSubmitted, setFeedbackIsSubmitted] = useState(false);


  const submit = () => {
    try {
      fetchWithAuth(`${API_URL}/v1/feedback/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          'Accept': "application/json",
        },
        body: JSON.stringify({
          analysis_id: claimId,
          rating: 1.0,
          comment: voteSignal.toString(),
          labels: [],
        }),
      });
    } catch (error) {
      console.log(error);
    }
    setFeedbackIsSubmitted(true);
  };


  return feedbackIsSubmitted ? (
    <p className={styles.thanksWrapper}>
      <span className={styles.thanks}>{t2("thanks")}</span>
    </p>
  ) : (
    <section>
      <div className={styles.feedbackRow}>
        <div className={styles.feedbackWrapper}>
          <p className={styles.convinceText}>
            {t("convincing")} ({voteSignal}/10)
          </p>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              id="slider"
              name="slider"
              min="0"
              max="10"
              step="1"
              value={voteSignal}
              onChange={(e) => setVoteSignal(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.ticks}>
              {[...Array(11).keys()].map((n) => (
                <div key={n} className={styles.tickWrapper}>
                  <div className={styles.tick}></div>
                  <div className={styles.tickLabel}>{n}</div>
                </div>
              ))}
            </div>
          </div>
 
        </div>
        <button
            className={styles.submitButton}
            onClick={submit}
          >
            {t2("submit")}
          </button>
      </div>
    </section>
    
  );
}
