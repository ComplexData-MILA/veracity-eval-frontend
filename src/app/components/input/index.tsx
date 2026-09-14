"use client"

import { useTranslations } from "next-intl";
import styles from "./input.module.scss";
import Image from 'next/image';
import { useEffect, useState, useRef } from "react";

type Props = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
};

export default function Input({onSubmit, disabled = false}: Props) {
  const t = useTranslations('chatpage');
  const [inputText, setInputText] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setInputText("");
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitText(inputText);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter inserts a newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  useEffect(() => {
    // Access URL parameters using window.location.search
    const queryParams = new URLSearchParams(window.location.search);
    const q = queryParams.get("q");

    if (q) {
      const decodedQuery = decodeURIComponent(q);
      setInputText(decodedQuery);

      // Automatically trigger form submission
      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 100);
    }
  }, []);

  /* Grow the box with its content, up to the max-height in the stylesheet. */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [inputText]);

  return (
    <form ref={formRef} className={styles.inputWrapper} onSubmit={handleSubmit}>
                <textarea ref={textareaRef}
                  className={styles.input}
                  placeholder={t('inputPlaceholder')}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  value={inputText}
                  rows={1}
                  disabled={disabled} />
                <button className={styles.submit} type="submit" disabled={disabled}>
                <Image src="/assets/logoBlue.svg" alt="me" width="20" height="20" />
                </button>
              </form>
  );
}
