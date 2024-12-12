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


export default function ChatWindow() {

  const t = useTranslations('chatpage');
  const [helpIsOpen, setHelpIsOpen] = useState(false);
  const [sourceWindow, setSourceWindow] = useState(2);

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
        <ChatOut text="Correlation implies causation" />
        <ChatIn text={t('outputTwo')} />
        <Analysis setSourceWindow={setSourceWindow} />
      </div>
    </div>
    <div className={styles.inputBar}>
    <Help helpIsOpen={helpIsOpen} setHelpIsOpen={setHelpIsOpen} />
      <Input />
    </div>
    <p className={styles.disclaimer}>{t('disclaimer')}</p>
  </section>
  <SourceWindow sourceWindow={sourceWindow} setSourceWindow={setSourceWindow} />
  </div>
  );
}