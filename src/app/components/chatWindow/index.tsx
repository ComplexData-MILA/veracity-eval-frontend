"use client"

import styles from "../../chat/page.module.scss";
import Image from 'next/image';
import { useState, useCallback  } from 'react';
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
  /*verification states*/
  const [finalAnalysis, setFinalAnalysis] = useState<FinalAnalysis | null>(null);
  const [isLoadingSources, setIsLoadingSources] = useState<boolean>(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [searchesUsed, setSearchesUsed] = useState<Search[]>([]);
  const [error, setError] = useState<string | null>(null);

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

    let language = ''

    if (locale == 'en') {
      language = 'english';
    } else if (locale == 'fr'){
      language = 'french'
    }

    try {
      setClaimIsSent(true);
      setFinalAnalysis(null);
      setSources([]);
      setSearchesUsed([]);
      setError(null);

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
  
      return () => {
        if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
      };
  
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Error verifying claim');
      eventSource?.close();
    }
  }, [locale,
    fetchWithAuth,
    claim,
    handleAnalysisComplete,
    setClaimIsSent,
    setFinalAnalysis,
    setSources,
    setSearchesUsed,
    setError


  ]);

  /*check auth0 user, send back to homepage if user is not logged in*/
  if (authLoading) return <div>Loading...</div>;
  if (authError) return <div>Authentication error: {authError.message}</div>;
  if (!user) redirect('/');
  
  return (
    <div className={styles.mainWrapper}>
    <section className={styles.mainSection}>
    <div className={styles.titleBar}>
      <h1 className={styles.title}>{t('title')}</h1>
      <div className={styles.learnMoreWrapper}>
      <Image src="/assets/info.svg" alt="me" width="20" height="20" />
        <Link href="/user-guidelines" className={styles.learnMoreText}>{t('learnMore')}</Link>
      </div>
    </div>
    <div className={styles.chatWindow}>
    {helpIsOpen === true ? <HelpWindow />:""}
      <div className={styles.mainChatColumn}>
        <ChatIn text={t('outputOne')}/>
        {claimIsSent === true ? <ChatOut text={claim} /> : <></>}
        {claimIsSent && !finalAnalysis ? <ChatIn text="..."/> : ""}
        {finalAnalysis && finalAnalysis.analysis_text ? 
        <>
        <ChatIn text={t('outputTwo')} />
        <Analysis setSourceWindow={setSourceWindow} finalAnalysis={finalAnalysis} sources={sources} claimId={claimId} /></>
        :<></>}
      {error? <p>{error}</p> : ""}
      </div>
    </div>
    <div className={styles.inputBar}>
    <Help helpIsOpen={helpIsOpen} setHelpIsOpen={setHelpIsOpen} />
      <Input setClaim={setClaim} verifyClaim={verifyClaim} claim={claim} />
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