
import { useTranslations } from "next-intl";
import styles from "./input.module.scss";
import Image from 'next/image';
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  setClaim: (arg0: string) => void;
  verifyClaim: () => void;
  claim: string;
};

export default function Input({setClaim, verifyClaim, claim}: Props) {
  const t = useTranslations('chatpage');
  const [inputText, setInputText] = useState<string>("");
  const searchParams = useSearchParams();
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
  const query = searchParams.get("q");
  if (query) {
    const decodedQuery = decodeURIComponent(query);
    setInputText(decodedQuery);

    // Ensure the form submission is triggered after the input is set
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.dispatchEvent(new Event("submit", { bubbles: true }));
      }
    }, 0);
  }
  }, [searchParams]);
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