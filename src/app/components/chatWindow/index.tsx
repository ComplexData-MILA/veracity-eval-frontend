"use client"

import styles from "../../chat/page.module.scss";
import Image from 'next/image';
import { useState } from 'react';
import Help from '../help';
import Input from '../input';


export default function ChatWindow() {

  const [helpIsOpen, setHelpIsOpen] = useState(true)
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
      {helpIsOpen === true ?
       <div className={styles.helpSection}>
        <h2 className={styles.helpHeading}>Ressources d&apos;aide populaires</h2>
        <p className={styles.helpText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        <br />
        <br />
        <a href="www.google.ca">Link out</a>
        </p>
       </div>:
        ""}
      
    </div>
    <div className={styles.inputBar}>
    <Help helpIsOpen={helpIsOpen} setHelpIsOpen={setHelpIsOpen} />
      <Input />
    </div>
    <p className={styles.disclaimer}>While we strive for accuracy, some AI responses may vary.</p>
  </section>
  );
}