
import { useTranslations } from "next-intl";
import styles from "./input.module.scss";
import Image from 'next/image';


export default function Input() {

  const t = useTranslations('chatpage');

  return (
    <div className={styles.inputWrapper}>
                <input className={styles.input} placeholder={t('inputPlaceholder')} />
                <button className={styles.submit}>
                <Image src="/assets/logoBlue.svg" alt="me" width="20" height="20" />
                </button>
              </div>
  );
}