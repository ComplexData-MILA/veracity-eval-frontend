"use client"

import styles from "../../chat/page.module.scss";
import Image from 'next/image';
import { useState } from 'react';
import Help from '../help';
import Input from '../input';
import HelpWindow from "../helpWindow";
import ChatIn from "../chatBubbles/chatIn";
import ChatOut from "../chatBubbles/chatOut";
import { useTranslations, useLocale } from "next-intl";
import Analysis from "../analysis";
import SourceWindow from "../sourceWindow";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { redirect } from "next/navigation";
import { FinalAnalysis, Search, Source } from "@/app/types";
import Link from "next/link";
import { API_URL} from "@/app/constants";

/*a clarifying question asked before fact-checking; answer is undefined while waiting*/
type ClarifyTurn = { question: string; options: string[]; answer?: string };
type ClarifyResponse = { status: 'ask' | 'ready'; claim: string; question?: string; options: string[]; assumptions: string[] };
type DiscussionIds = { conversation_id: string; claim_conversation_id: string; claim_id: string };
type ChatLine = { from: 'user' | 'bot'; text: string };

export default function ChatWindow() {
  const t = useTranslations('chatpage');
  const { fetchWithAuth, user, error: authError, isLoading: authLoading } = useAuthApi();
  /*UI window states*/
  const [helpIsOpen, setHelpIsOpen] = useState<boolean>(false);
  const [sourceWindow, setSourceWindow] = useState<number>(1);
  /*input state*/
  const [claim, setClaim] = useState<string>("");
  const [claimId, setClaimId] = useState<string | null>(null);
  const [claimIsSent, setClaimIsSent] = useState<boolean>(false);
  /* Language */
  const locale = useLocale();
  const language = locale == 'fr' ? 'french' : 'english';
  /*clarification states: questions asked before the check, and the claim actually checked*/
  const [turns, setTurns] = useState<ClarifyTurn[]>([]);
  const [isClarifying, setIsClarifying] = useState<boolean>(false);
  const [checkedClaim, setCheckedClaim] = useState<string | null>(null);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  /*verification states*/
  const [finalAnalysis, setFinalAnalysis] = useState<FinalAnalysis | null>(null);
  const [isLoadingSources, setIsLoadingSources] = useState<boolean>(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [searchesUsed, setSearchesUsed] = useState<Search[]>([]);
  const [error, setError] = useState<string | null>(null);
  /*set when the backend served this analysis from its cache: when the original check ran*/
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  /*follow-up chat states*/
  const [discussion, setDiscussion] = useState<DiscussionIds | null>(null);
  const [followups, setFollowups] = useState<ChatLine[]>([]);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [recheckClaim, setRecheckClaim] = useState<string | null>(null);

  const pendingQuestion = turns.length > 0 && turns[turns.length - 1].answer === undefined;

  const getAccessToken = async () => {
    const tokenResponse = await fetch('/api/auth/token');
    if (!tokenResponse.ok) {
      throw new Error('Failed to get authentication token');
    }
    const { accessToken } = await tokenResponse.json();
    return accessToken as string;
  };

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
      cached?: boolean;
      cached_at?: string;
    }
  }, eventSource: EventSource | null, newClaimId: string) => {
    try {
      setCachedAt(data.content.cached && data.content.cached_at ? data.content.cached_at : null);
      if (data.content.conversation_id && data.content.claim_conversation_id) {
        setDiscussion({
          conversation_id: data.content.conversation_id,
          claim_conversation_id: data.content.claim_conversation_id,
          claim_id: newClaimId,
        });
      }
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

  const verifyClaim = async (claimText: string, claimAssumptions: string[]) => {
    let eventSource: EventSource | null = null;

    try {
      setClaimIsSent(true);
      setCheckedClaim(claimText);
      setAssumptions(claimAssumptions);
      setFinalAnalysis(null);
      setSources([]);
      setSearchesUsed([]);
      setError(null);
      setCachedAt(null);
      setDiscussion(null);
      setFollowups([]);
      setRecheckClaim(null);

      const claimResponse = await fetchWithAuth(`${API_URL}/v1/claims/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          claim_text: claimText,
          context: claimAssumptions.length > 0 ? claimAssumptions.join('; ') : claimText,
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

      const accessToken = await getAccessToken();
  
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
            await handleAnalysisComplete(data, eventSource, claimData.id);
          }
        } catch (err: unknown) {
          console.error('Error handling stream data:', err);
          if (err instanceof Error) {
            setError(err.message);
          }
          eventSource?.close();
        }
      };
  
      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
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
  
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Error verifying claim');
      eventSource?.close();
    }
  };

  /*ask the backend whether the claim needs a clarifying question; on any failure, check the claim as written*/
  const clarifyClaim = async (text: string, nextTurns: ClarifyTurn[]) => {
    setTurns(nextTurns);
    setIsClarifying(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/v1/claims/clarify`, {
        method: 'POST',
        body: JSON.stringify({
          text,
          language,
          turns: nextTurns.map((turn) => ({ question: turn.question, answer: turn.answer ?? null })),
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to clarify claim: ${await response.text()}`);
      }
      const data: ClarifyResponse = await response.json();
      setIsClarifying(false);
      if (data.status === 'ask' && data.question) {
        setTurns([...nextTurns, { question: data.question, options: data.options ?? [] }]);
      } else {
        await verifyClaim(data.claim || text, data.assumptions ?? []);
      }
    } catch (err) {
      console.error('Clarification failed, checking the claim as written:', err);
      setIsClarifying(false);
      await verifyClaim(text, []);
    }
  };

  const startNewClaim = (text: string) => {
    setClaim(text);
    setClaimIsSent(true);
    setCheckedClaim(null);
    setAssumptions([]);
    setFinalAnalysis(null);
    setError(null);
    setDiscussion(null);
    setFollowups([]);
    setRecheckClaim(null);
    clarifyClaim(text, []);
  };

  const answerQuestion = (answer: string) => {
    if (isClarifying) return;
    clarifyClaim(claim, turns.map((turn, i) => (i === turns.length - 1 ? { ...turn, answer } : turn)));
  };

  const resetChat = () => {
    setClaim("");
    setClaimIsSent(false);
    setTurns([]);
    setCheckedClaim(null);
    setAssumptions([]);
    setFinalAnalysis(null);
    setSources([]);
    setSearchesUsed([]);
    setError(null);
    setCachedAt(null);
    setDiscussion(null);
    setFollowups([]);
    setRecheckClaim(null);
  };

  const startRecheck = (claimText: string) => {
    setClaim(claimText);
    setTurns([]);
    verifyClaim(claimText, []);
  };

  /*stream an answer to a follow-up question about the current result*/
  const sendFollowup = async (text: string) => {
    if (!discussion || isReplying) return;
    setRecheckClaim(null);
    setIsReplying(true);
    setFollowups((prev) => [...prev, { from: 'user', text }, { from: 'bot', text: '...' }]);
    const setReply = (reply: string) =>
      setFollowups((prev) => [...prev.slice(0, -1), { from: 'bot', text: reply }]);

    let reply = '';
    try {
      const accessToken = await getAccessToken();
      const url = new URL(`${API_URL}/v1/messages/stream`);
      url.searchParams.append('conversation_id', discussion.conversation_id);
      url.searchParams.append('claim_conversation_id', discussion.claim_conversation_id);
      url.searchParams.append('claim_id', discussion.claim_id);
      url.searchParams.append('content', text);
      url.searchParams.append('access_token', accessToken);
      const eventSource = new EventSource(url.toString(), { withCredentials: true });

      const finish = () => {
        eventSource.close();
        if (!reply) setReply(t('followupError'));
        setIsReplying(false);
      };

      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') {
          finish();
          return;
        }
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'router_decision' && data.content === 'search') {
            setReply(t('searchingMore'));
          } else if (data.type === 'recheck_proposed' && data.content?.claim_text) {
            setRecheckClaim(data.content.claim_text);
          } else if (data.type === 'content') {
            reply += data.content;
            setReply(reply);
          } else if (data.type === 'error') {
            console.error('Follow-up stream error:', data.content);
          }
        } catch (err) {
          console.error('Error handling follow-up stream data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('Follow-up EventSource error:', err);
        finish();
      };
    } catch (err) {
      console.error('Follow-up error:', err);
      setReply(t('followupError'));
      setIsReplying(false);
    }
  };

  const handleInput = (text: string) => {
    if (pendingQuestion) {
      answerQuestion(text);
    } else if (discussion && finalAnalysis) {
      sendFollowup(text);
    } else {
      startNewClaim(text);
    }
  };

  /*check auth0 user, send back to homepage if user is not logged in*/
  if (authLoading) return <div>Loading...</div>;
  if (authError) return <div>Authentication error: {authError.message}</div>;
  if (!user) redirect('/');

  const checkingText = checkedClaim
    ? [
        checkedClaim !== claim ? t('checking', { claim: checkedClaim }) : '',
        assumptions.length > 0 ? t('assuming', { assumptions: assumptions.join('; ') }) : '',
      ].filter(Boolean).join(' ')
    : '';
  
  return (
    <div className={styles.mainWrapper}>
    <section className={styles.mainSection}>
    <div className={styles.titleBar}>
      <h1 className={styles.title}>{t('title')}</h1>
      <div className={styles.learnMoreWrapper}>
      <Image src="/assets/info.svg" alt="me" width="20" height="20" />
        <Link href="/user-guidelines" target="_blank" rel="noopener noreferrer" className={styles.learnMoreText} >{t('learnMore')} </Link>
      </div>
    </div>
    <div className={styles.chatWindow}>
    {helpIsOpen === true ? <HelpWindow />:""}
      <div className={styles.mainChatColumn}>
        <ChatIn text={t('outputOne')}/>
        {claimIsSent === true ? <ChatOut text={claim} /> : <></>}
        {turns.map((turn, i) => (
          <div key={`turn-${i}`}>
            <ChatIn text={turn.question} />
            {turn.answer === undefined ? (
              <div className={styles.optionRow}>
                {turn.options.map((option) => (
                  <button key={option} type="button" className={styles.optionButton} disabled={isClarifying} onClick={() => answerQuestion(option)}>{option}</button>
                ))}
                <button type="button" className={styles.optionButton} disabled={isClarifying} onClick={() => document.getElementById('chat-input')?.focus()}>{t('typeOwn')}</button>
              </div>
            ) : (
              <ChatOut text={turn.answer} />
            )}
          </div>
        ))}
        {isClarifying ? <ChatIn text="..."/> : ""}
        {checkingText ? <ChatIn text={checkingText} /> : ""}
        {checkedClaim && !finalAnalysis ? <ChatIn text="..."/> : ""}
        {finalAnalysis && finalAnalysis.analysis_text ? 
        <>
        <ChatIn text={t('outputTwo')} />
        <Analysis setSourceWindow={setSourceWindow} finalAnalysis={finalAnalysis} sources={sources} claimId={claimId} />
        {cachedAt ? <p className={styles.disclaimer}>{t('cachedDisclaimer', { date: new Date(cachedAt).toLocaleDateString(locale, { dateStyle: 'medium' }) })}</p> : ""}</>
        :<></>}
        {followups.map((line, i) => (
          line.from === 'user' ? <ChatOut key={`followup-${i}`} text={line.text} /> : <ChatIn key={`followup-${i}`} text={line.text} />
        ))}
        {recheckClaim ? (
          <div className={styles.optionRow}>
            <button type="button" className={styles.optionButton} disabled={isReplying} onClick={() => startRecheck(recheckClaim)}>{t('recheck', { claim: recheckClaim })}</button>
          </div>
        ) : ""}
        {discussion && finalAnalysis && !isReplying ? (
          <div className={styles.optionRow}>
            <button type="button" className={styles.optionButton} onClick={resetChat}>{t('newClaim')}</button>
          </div>
        ) : ""}
      {error? <p>{error}</p> : ""}
      </div>
    </div>
    <div className={styles.inputBar}>
    <Help helpIsOpen={helpIsOpen} setHelpIsOpen={setHelpIsOpen} />
      <Input onSubmit={handleInput} placeholder={discussion && finalAnalysis ? t('followupPlaceholder') : pendingQuestion ? t('answerPlaceholder') : undefined} />
    </div>
    <p className={styles.disclaimer}>{t('disclaimer')}</p>
  </section>
  <SourceWindow sourceWindow={sourceWindow} 
                setSourceWindow={setSourceWindow}  
                isLoadingSources={isLoadingSources}
                sources={sources}
                searches={searchesUsed} />
  </div>
  );
}
