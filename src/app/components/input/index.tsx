
import { useTranslations } from "next-intl";
import styles from "./input.module.scss";
import Image from 'next/image';
import { useEffect, useState, useRef } from "react";

type Props = {
  setClaim: (arg0: string) => void;
  verifyClaim: () => void;
  claim: string;
};

export default function Input({setClaim, verifyClaim, claim}: Props) {
  const t = useTranslations('chatpage');
  const [inputText, setInputText] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (newText: string) => {
    setInputText(newText)
  }
  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClaim(inputText);
    setInputText("");
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
        formRef.current?.dispatchEvent(new Event("submit", { bubbles: true }));
      }, 100);
    }
  }, []);
  useEffect(() => {
    if (claim !== '') {
        verifyClaim();
    }
  }, [claim]);

  return (
    <form ref={formRef} className={styles.inputWrapper} onSubmit={handleSubmit}>
                <input className={styles.input} placeholder={t('inputPlaceholder')} onChange={(e) => handleChange(e.target.value)} value={inputText} />
                <button className={styles.submit} type="submit">
                <Image src="/assets/logoBlue.svg" alt="me" width="20" height="20" />
                </button>
              </form>
  );
}