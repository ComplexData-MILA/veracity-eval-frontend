
import { useTranslations } from "next-intl";
import styles from "./input.module.scss";
import Image from 'next/image';
import { useEffect, useState } from "react";


type Props = {
  setClaim: (arg0: string) => void;
  verifyClaim: () => void;
  claim: string;
};

export default function Input({setClaim, verifyClaim, claim}: Props) {
  const t = useTranslations('chatpage');
  let [inputText, setInputText] = useState<string>("");

  const handleChange = (newText: string) => {
    setInputText(newText)
  }
  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClaim(inputText);
}
  useEffect(() => {
    if (claim !== '') {
        verifyClaim();
    }
  }, [claim]);

  return (
    <form className={styles.inputWrapper} onSubmit={handleSubmit}>
                <input className={styles.input} placeholder={t('inputPlaceholder')} onChange={(e) => handleChange(e.target.value)} value={inputText} />
                <button className={styles.submit} type="submit">
                <Image src="/assets/logoBlue.svg" alt="me" width="20" height="20" />
                </button>
              </form>
  );
}