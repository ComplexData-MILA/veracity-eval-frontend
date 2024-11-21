"use client"

import styles from "../../chat/page.module.scss";
import Image from 'next/image';
import { useState } from 'react';
import Help from '../help';
import Input from '../input';
import HelpWindow from "../helpWindow";


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
    </div>
    <div className={styles.inputBar}>
    <Help helpIsOpen={helpIsOpen} setHelpIsOpen={setHelpIsOpen} />
      <Input />
    </div>
    <p className={styles.disclaimer}>While we strive for accuracy, some AI responses may vary.</p>
  </section>
  );
}