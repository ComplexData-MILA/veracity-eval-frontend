"use client"

import styles from "../../chat/page.module.scss";
import Image from 'next/image';
import { useState } from 'react';
import Help from '../help';
import Input from '../input';
import HelpWindow from "../helpWindow";
import ChatIn from "../chatBubbles/chatIn";
import ChatOut from "../chatBubbles/chatOut";
import { useTranslations } from "next-intl";
import Analysis from "../analysis";
import SourceWindow from "../sourceWindow";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { redirect } from "next/navigation";
import { FinalAnalysis, Source, AnalysisStreamEvent } from "@/app/types";

const API_URL = 'https://api.veri-fact.ai';

export default function ChatWindow() {
  const t = useTranslations('chatpage');
  const { fetchWithAuth, user, error: authError, isLoading: authLoading } = useAuthApi();
  
  const [helpIsOpen, setHelpIsOpen] = useState<boolean>(false);
  const [sourceWindow, setSourceWindow] = useState<number>(1);
  const [claim, setClaim] = useState<string>("");
  const [analysisStream, setAnalysisStream] = useState<AnalysisStreamEvent[]>([]);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isLoadingSources, setIsLoadingSources] = useState<boolean>(false);
  const [finalAnalysis, setFinalAnalysis] = useState<FinalAnalysis | null>(null);
  const [claimIsSent, setClaimIsSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  /*not integrated*/
  const [sources, setSources] = useState<Source[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [claimConversationId, setClaimConversationId] = useState<string | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);
  /*end not integrated*/

  if (authLoading) return <div>Loading authentication...</div>;
  if (authError) return <div>Authentication error: {authError.message}</div>;
  if (!user) redirect('/');

  /*Obviously these should be extracted to another file...*/
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

  const verifyClaim = async () => {
    let eventSource: EventSource | null = null;
    
    try {
      setIsVerifying(true);
      setClaimIsSent(true);
      setAnalysisStream([]);
      setFinalAnalysis(null);
      setSources([]);
      setError(null);
  
      const claimResponse = await fetchWithAuth(`${API_URL}/v1/claims/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          claim_text: claim,
          context: claim
        })
      });
  
      if (!claimResponse.ok) {
        throw new Error(`Failed to create claim: ${await claimResponse.text()}`);
      }
  
      const claimData = await claimResponse.json();
      setClaimId(claimData.id);
      
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
          setIsVerifying(false);
          return;
        }
  
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'error') {
            throw new Error(data.content);
          }
          
          setAnalysisStream(prev => [...prev, data]);
  
          if (data.type === 'analysis_complete' && data.content?.analysis_id) {
            await handleAnalysisComplete(data, eventSource);
          }
        } catch (err: unknown) {
          console.error('Error handling stream data:', err);
          if (err instanceof Error) {
            setError(err.message);
          }
          eventSource?.close();
          setIsVerifying(false);
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
        setIsVerifying(false);
      };
  
      return () => {
        if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
      };
  
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Error verifying claim');
      eventSource?.close();
    } finally {
      setIsVerifying(false);
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
      if (data.content.conversation_id) {
        setConversationId(data.content.conversation_id);
      }
      if (data.content.claim_conversation_id) {
        setClaimConversationId(data.content.claim_conversation_id);
      }
  
      const analysisResponse = await fetchWithAuth(
        `${API_URL}/v1/analysis/${data.content.analysis_id}`
      );
      
      if (!analysisResponse.ok) {
        throw new Error(`Failed to fetch final analysis: ${await analysisResponse.text()}`);
      }
      
      const analysisData = await analysisResponse.json();
      setFinalAnalysis(analysisData);
  
      await fetchSources(data.content.analysis_id);
    } catch (err) {
      console.error('Error handling analysis completion:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete analysis');
    } finally {
      eventSource?.close();
      setIsVerifying(false);
    }
  };
  /* end abstract these*/


  return (
    <div className={styles.mainWrapper}>
    <section className={styles.mainSection}>
    <div className={styles.titleBar}>
      <h1 className={styles.title}>Veracity AI</h1>
      <div className={styles.learnMoreWrapper}>
      <Image src="/assets/info.svg" alt="me" width="20" height="20" />
        <p className={styles.learnMoreText}>{t('learnMore')}</p>
      </div>
    </div>
    <div className={styles.chatWindow}>
    {helpIsOpen === true ? <HelpWindow />:""}
      <div className={styles.mainChatColumn}>
        <ChatIn text={t('outputOne')}/>
        {isVerifying? <ChatIn text="..."/> : ""}
        {claimIsSent === true ? <ChatOut text={claim} /> : <></>}
        {finalAnalysis && finalAnalysis.analysis_text ? 
        <>
        <ChatIn text={t('outputTwo')} />
        <Analysis setSourceWindow={setSourceWindow} finalAnalysis={finalAnalysis} sources={sources} /></>
        :<></>}
      {error? <p>{error}</p> : ""}
      {/*dirty print*/}
        {analysisStream && <p>{analysisStream.toString()}</p>}
        {claimId? <p>{claimId}</p> : ""}
        {sources.length > 0? <p>{JSON.stringify(sources)}</p> : ""}
        {conversationId? <p>{conversationId}</p> : ""}
        {claimConversationId? <p>{claimConversationId}</p> : ""}
      </div>
    </div>
    <div className={styles.inputBar}>
    <Help helpIsOpen={helpIsOpen} setHelpIsOpen={setHelpIsOpen} />
      <Input setClaim={setClaim} verifyClaim={verifyClaim} />
    </div>
    <p className={styles.disclaimer}>{t('disclaimer')}</p>
  </section>
  <SourceWindow sourceWindow={sourceWindow} setSourceWindow={setSourceWindow} isLoadingSources={isLoadingSources} />
  </div>
  );
}