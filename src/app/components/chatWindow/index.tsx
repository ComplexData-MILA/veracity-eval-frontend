"use client"

import styles from "../../chat/page.module.scss";
import Image from 'next/image';
import { useState } from 'react';
import Help from '../help';
import Input from '../input';
import HelpWindow from "../helpWindow";
import ChatIn from "../chatBubbles/chatIn";
import ChatOut from "../chatBubbles/chatOut";


export default function ChatWindow() {

  const [helpIsOpen, setHelpIsOpen] = useState(false)
  return (
    <section className={styles.mainSection}>
    <div className={styles.titleBar}>
      <h1 className={styles.title}>Veracity AI</h1>
      <div className={styles.learnMoreWrapper}>
      <Image src="/assets/info.svg" alt="me" width="20" height="20" />
        <p className={styles.learnMoreText}>Learn more about the model</p>
      </div>
    </div>
    <div className={styles.chatWindow}>
    {helpIsOpen === true ? <HelpWindow />:""}
      <div className={styles.mainChatColumn}>
        <ChatIn text="What would you like to verify today?" />
        <ChatOut text="Correlation implies causation" />
        <ChatIn text="Here is my analysis:" />
        <div className={styles.placeholder}>
          <h1>Design en route</h1>
        </div>
      </div>
    </div>
    <div className={styles.inputBar}>
    <Help helpIsOpen={helpIsOpen} setHelpIsOpen={setHelpIsOpen} />
      <Input />
    </div>
    <p className={styles.disclaimer}>While we strive for accuracy, some AI responses may vary.</p>
  </section>
  );
}