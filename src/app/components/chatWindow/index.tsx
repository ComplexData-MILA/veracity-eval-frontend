"use client"

import { API_URL } from "@/app/constants";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { FinalAnalysis, Search, Source } from "@/app/types";
import { useLocale, useTranslations } from "next-intl";
import Image from 'next/image';
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import styles from "../../chat/page.module.scss";
import Analysis from "../analysis";
import ChatIn from "../chatBubbles/chatIn";
import ChatOut from "../chatBubbles/chatOut";
import Help from '../help';
import HelpWindow from "../helpWindow";
import Input from '../input';
import SourceWindow from "../sourceWindow";

/* NEW: response shape returned by backend /v1/media/verify */
type MediaVerificationResult = {
  media_type?: string;
  p_fake: number;
  reliability: number;
  reliability_score: number;
  verdict: string;
  n_frames?: number;
  frame_probs?: number[] | null;
  explanation: string;
};

export default function ChatWindow() {
  const t = useTranslations('chatpage');
  const { fetchWithAuth, user, error: authError, isLoading: authLoading } = useAuthApi();

  /* UI window states */
  const [helpIsOpen, setHelpIsOpen] = useState<boolean>(false);
  const [sourceWindow, setSourceWindow] = useState<number>(1);

  /* NEW: popup explaining media reliability score */
  const [mediaScoreInfoOpen, setMediaScoreInfoOpen] = useState<boolean>(false);

  /* input state */
  const [claim, setClaim] = useState<string>("");
  const [claimId, setClaimId] = useState<string | null>(null);
  const [claimIsSent, setClaimIsSent] = useState<boolean>(false);

  /* Language */
  const locale = useLocale();

  /* verification states */
  const [finalAnalysis, setFinalAnalysis] = useState<FinalAnalysis | null>(null);
  const [isLoadingSources, setIsLoadingSources] = useState<boolean>(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [searchesUsed, setSearchesUsed] = useState<Search[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* NEW: media verification loading state */
  const [isVerifyingMedia, setIsVerifyingMedia] = useState<boolean>(false);

  /* NEW: media verification result shown inside the chat */
  const [mediaResult, setMediaResult] = useState<MediaVerificationResult | null>(null);
  const [submittedMediaName, setSubmittedMediaName] = useState<string | null>(null);
  const [submittedMediaPreview, setSubmittedMediaPreview] = useState<string | null>(null);
  const [submittedMediaType, setSubmittedMediaType] = useState<string | null>(null);

  const showMediaSubmission = Boolean(submittedMediaPreview);
  const showMediaResult = Boolean(mediaResult);
  const showMediaVerification = Boolean(submittedMediaPreview || isVerifyingMedia || mediaResult);
  /* NEW: frontend-only feedback for media result */
  const [mediaFeedbackRating, setMediaFeedbackRating] = useState<number | null>(null);
  const [mediaFeedbackSubmitted, setMediaFeedbackSubmitted] = useState<boolean>(false);
  /* NEW: cleanup browser preview URL when media preview changes/unmounts */
  useEffect(() => {
    return () => {
      if (submittedMediaPreview) {
        URL.revokeObjectURL(submittedMediaPreview);
      }
    };
  }, [submittedMediaPreview]);

  const fetchSources = async (analysisId: string) => {
    try {
      setIsLoadingSources(true);
      const sourcesResponse = await fetchWithAuth(
        `${API_URL}/v1/sources/analysis/${analysisId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );

      if (!sourcesResponse.ok) {
        throw new Error(`Failed to fetch sources: ${await sourcesResponse.text()}`);
      }

      const sourcesData = await sourcesResponse.json();
      setSources(sourcesData);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setIsLoadingSources(false);
    }
  };

  const fetchSearches = async (analysisId: string) => {
    try {
      const searchesResponse = await fetchWithAuth(
        `${API_URL}/v1/searches/analysis/${analysisId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );

      if (!searchesResponse.ok) {
        throw new Error(`Failed to fetch search ID's: ${await searchesResponse.text()}`);
      }

      const searchData = await searchesResponse.json();
      setSearchesUsed(searchData);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    }
  };

  const handleAnalysisComplete = async (data: {
    type: 'analysis_complete';
    content: {
      analysis_id: string;
      claim_conversation_id: string;
      conversation_id: string;
    }
  }, eventSource: EventSource | null) => {
    try {
      const analysisResponse = await fetchWithAuth(
        `${API_URL}/v1/analysis/${data.content.analysis_id}`
      );

      if (!analysisResponse.ok) {
        throw new Error(`Failed to fetch final analysis: ${await analysisResponse.text()}`);
      }

      const analysisData = await analysisResponse.json();
      setFinalAnalysis(analysisData);
      setClaimId(analysisData.id);

      await fetchSources(data.content.analysis_id);
      await fetchSearches(data.content.analysis_id);
    } catch (err) {
      console.error('Error handling analysis completion:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete analysis');
    } finally {
      eventSource?.close();
    }
  };

  const verifyClaim = useCallback(async () => {
    let eventSource: EventSource | null = null;

    let language = '';

    if (locale == 'en') {
      language = 'english';
    } else if (locale == 'fr') {
      language = 'french';
    }

    try {
      setClaimIsSent(true);

      /* NEW: clear media result when user starts text verification */
      setMediaResult(null);
      setSubmittedMediaName(null);
      setSubmittedMediaPreview(null);
      setSubmittedMediaType(null);

      setFinalAnalysis(null);
      setSources([]);
      setSearchesUsed([]);
      setError(null);

      setMediaFeedbackRating(null);
      setMediaFeedbackSubmitted(false);

      const claimResponse = await fetchWithAuth(`${API_URL}/v1/claims/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          claim_text: claim,
          context: claim,
          language: language
        })
      });

      if (!claimResponse.ok) {
        throw new Error(`Failed to create claim: ${await claimResponse.text()}`);
      }

      const claimData = await claimResponse.json();

      fetchWithAuth(`${API_URL}/v1/claims/${claimData.id}/embedding`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })
        .then(() => console.log('Embedding update completed successfully'))
        .catch(err => console.error('Embedding generation failed:', err));

      const tokenResponse = await fetch('/api/auth/token');
      if (!tokenResponse.ok) {
        throw new Error('Failed to get authentication token');
      }

      const { accessToken } = await tokenResponse.json();

      const streamUrl = `${API_URL}/v1/analysis/claim/${claimData.id}/stream`;

      const urlWithToken = new URL(streamUrl);
      urlWithToken.searchParams.append('access_token', accessToken);
      eventSource = new EventSource(urlWithToken.toString(), { withCredentials: true });

      eventSource.onopen = () => {
        console.log('EventSource connection established');
      };

      eventSource.onmessage = async (event) => {
        if (event.data === '[DONE]') {
          eventSource?.close();
          return;
        }

        try {
          const data = JSON.parse(event.data);

          if (data.type === 'error') {
            throw new Error(data.content);
          }

          if (data.type === 'analysis_complete' && data.content?.analysis_id) {
            await handleAnalysisComplete(data, eventSource);
          }
        } catch (err: unknown) {
          console.log('Error handling stream data:', err);
          if (err instanceof Error) {
            setError(err.message);
          }
          else {
            setError('Sorry, we couldn’t complete the analysis. Please try again.');}
            eventSource?.close();}};

      eventSource.onerror = () => {
        console.log('EventSource error');
        let errorMessage = 'Connection to analysis stream failed. Please try again.';

        switch (eventSource?.readyState) {
          case EventSource.CONNECTING:
            errorMessage = 'Connection failed. Please check your internet connection.';
            break;
          case EventSource.CLOSED:
            errorMessage = 'Connection closed unexpectedly. Please try again.';
            break;
        }

        setError(errorMessage);
        eventSource?.close();
      };

      return () => {
        if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
      };

    } catch (err) {
      console.log('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Error verifying claim');
      eventSource?.close();
    }
  }, [
    locale,
    fetchWithAuth,
    claim,
    handleAnalysisComplete,
    setClaimIsSent,
    setFinalAnalysis,
    setSources,
    setSearchesUsed,
    setError
  ]);

  /* NEW: sends selected image/video/GIF to backend /v1/media/verify */
  const verifyMedia = useCallback(
    async (file: File) => {
      try {
        setIsVerifyingMedia(true);
        setError(null);

        /* NEW: show selected media preview and clear old media result */
        setSubmittedMediaName(file.name);
        setSubmittedMediaPreview(URL.createObjectURL(file));
        setSubmittedMediaType(file.type);
        setMediaResult(null);

        /* NEW: clear text-analysis UI so old text results do not mix with media results */
        setClaim("");
        setClaimId(null);
        setClaimIsSent(false);
        setFinalAnalysis(null);
        setSources([]);
        setSearchesUsed([]);

        /*
          NEW: FormData sends the file to the backend.
          The image/video is not stored by the frontend.
        */
        const formData = new FormData();
        formData.append("file", file);

        console.log("Calling media endpoint:", `${API_URL}/v1/media/verify`);

        const response = await fetchWithAuth(`${API_URL}/v1/media/verify`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();

        console.log("OpenFake media result:", data);

        /* NEW: save backend response so it renders in the chat */
        setMediaResult(data);
      } catch (err) {
        console.log("Media verification error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not verify this media."
        );
      } finally {
        setIsVerifyingMedia(false);
      }
    },
    [fetchWithAuth]
  );

  /*check auth0 user, send back to homepage if user is not logged in*/
  if (authLoading) return <div>Loading...</div>;
  if (authError) return <div>Authentication error: {authError.message}</div>;
  if (!user) redirect('/');

  return (
    <div className={styles.mainWrapper}>
      <section
        className={`${styles.mainSection} ${
          showMediaVerification ? styles.mediaModeMainSection : ""
        }`}
      >
        <div className={styles.titleBar}>
          <h1 className={styles.title}>{t('title')}</h1>
          <div className={styles.learnMoreWrapper}>
            <Image src="/assets/info.svg" alt="me" width="20" height="20" />
            <Link href="/user-guidelines" target="_blank" rel="noopener noreferrer" className={styles.learnMoreText}>
              {t('learnMore')}
            </Link>
          </div>
        </div>

        <div className={styles.chatWindow}>
          {helpIsOpen === true ? <HelpWindow /> : ""}
          <div className={styles.mainChatColumn}>
            <ChatIn text={t('outputOne')} />

            {claimIsSent === true ? <ChatOut text={claim} /> : <></>}

            {claimIsSent && !finalAnalysis ? <ChatIn text="..." /> : ""}

            {finalAnalysis && finalAnalysis.analysis_text ?
              <>
                <ChatIn text={t('outputTwo')} />
                <Analysis setSourceWindow={setSourceWindow} finalAnalysis={finalAnalysis} sources={sources} claimId={claimId} />
              </>
              : <></>}

            {/* NEW: uploaded media shown as the user's submitted input on the right */}
{showMediaSubmission ? (
  <div className={styles.mediaUserMessageRow}>
    <div className={styles.mediaUserPreviewBubble}>
      {submittedMediaType?.startsWith("video/") ? (
        <video
          src={submittedMediaPreview || ""}
          controls
          className={styles.mediaUserPreview}
        />
      ) : (
        <img
          src={submittedMediaPreview || ""}
          alt={submittedMediaName || "Uploaded media"}
          className={styles.mediaUserPreview}
        />
      )}
    </div>

    <div className={styles.mediaUserAvatar}>SA</div>
  </div>
) : null}

{/* NEW: loading state while OpenFake is analyzing the media */}
{isVerifyingMedia ? <ChatIn text="Analyzing media..." /> : ""}

{/* NEW: reliability score and limitations shown together after result is ready */}
{showMediaResult && mediaResult ? (
  <div className={styles.mediaResultGrid}>
    <div className={styles.mediaReliabilityCard}>
      <div className={styles.mediaReliabilityTop}>
        <div className={styles.mediaReliabilityTitleRow}>
          <h3 className={styles.mediaReliabilityTitle}>Reliability score</h3>
          <span className={styles.mediaInfoIcon}>i</span>
        </div>

        <button
          type="button"
          className={styles.mediaReliabilityLink}
          onClick={() => setMediaScoreInfoOpen(true)}
        >
          How is this calculated?
        </button>
      </div>

      <div className={styles.mediaReliabilityContent}>
        <div
          className={styles.mediaScoreCircle}
          style={{ "--score": mediaResult.reliability_score } as CSSProperties}
        >
          <div className={styles.mediaScoreInner}>
            <span className={styles.mediaScoreLabel}>Reliability</span>
            <span className={styles.mediaScoreValue}>
              {mediaResult.reliability_score}%
            </span>
          </div>
        </div>

        <div className={styles.mediaVerdictBlock}>
          <h2 className={styles.mediaVerdictHeadline}>
            {mediaResult.verdict === "Likely real"
              ? "This media is likely reliable,"
              : mediaResult.verdict === "Likely fake"
              ? "This media may be manipulated,"
              : "This media should be reviewed carefully,"}
          </h2>

          <p className={styles.mediaVerdictSubtext}>
            {mediaResult.explanation}
          </p>
        </div>
      </div>
      {/* NEW: media feedback row */}
<div className={styles.mediaFeedbackRow}>
  <span>How convincing is this media analysis?</span>

  <div className={styles.mediaFeedbackStars} aria-label="Rate media analysis">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        className={
          mediaFeedbackRating && star <= mediaFeedbackRating
            ? styles.mediaFeedbackStarActive
            : ""
        }
        onClick={() => {
          setMediaFeedbackRating(star);
          setMediaFeedbackSubmitted(true);
        }}
      >
        ☆
      </button>
    ))}
  </div>

  {mediaFeedbackSubmitted ? (
    <span className={styles.mediaFeedbackThanks}>Thanks!</span>
  ) : null}
</div>
    </div>

    <aside className={styles.mediaSidePanel}>
      <p className={styles.mediaSideLead}>
        Files are processed in memory and not stored.
      </p>

      <p className={styles.mediaSideText}>
        The detector can make mistakes. Results are probabilistic and should not
        be treated as ground truth.
      </p>

      <div className={styles.mediaSideLimitations}>
        <h4>Known limitations:</h4>
        <ul>
          <li>Performance is strongest on fully AI-generated images.</li>
          <li>
            Subtle manipulations such as lip sync and localized inpainting may
            not be reliably detected.
          </li>
          <li>
            Images with text overlays are frequently misclassified as
            AI-generated.
          </li>
          <li>
            Video analysis may be less accurate in scenes with heavy motion
            blur.
          </li>
          <li>
            The model is better on realistic images and can fail on non-AI art,
            3D models, or drawings.
          </li>
        </ul>
      </div>
    </aside>
  </div>
) : null}
            {error ? <p>{error}</p> : ""}
          </div>
        </div>

        <div className={styles.inputBar}>
          <Help helpIsOpen={helpIsOpen} setHelpIsOpen={setHelpIsOpen} />
          <Input
            setClaim={setClaim}
            verifyClaim={verifyClaim}
            claim={claim}
            verifyMedia={verifyMedia}
            isVerifyingMedia={isVerifyingMedia}
          />
        </div>

        <p className={styles.disclaimer}>{t('disclaimer')}</p>
      </section>

      {/* NEW: hide the normal Sources panel during media verification so the
          reliability card and limitations panel can sit side by side */}
      {!showMediaVerification ? (
        <SourceWindow
          sourceWindow={sourceWindow}
          setSourceWindow={setSourceWindow}
          isLoadingSources={isLoadingSources}
          sources={sources}
          searches={searchesUsed}
        />
      ) : null}

      {/* NEW: popup explaining how media reliability score is computed */}
      {mediaScoreInfoOpen ? (
        <div
          className={styles.mediaScorePopupOverlay}
          onClick={() => setMediaScoreInfoOpen(false)}
        >
          <div
            className={styles.mediaScorePopup}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.mediaScorePopupClose}
              onClick={() => setMediaScoreInfoOpen(false)}
              aria-label="Close score explanation"
            >
              ×
            </button>

            <h3>How the score is computed</h3>

            <p>
              We use a Swin Transformer V2 model fine-tuned to distinguish real
              photographs from AI-generated images. For videos and GIFs, we sample 5
              frames evenly across the duration and average the model&apos;s
              confidence. The score shown is the model&apos;s estimated probability
              that the content was generated by AI.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}