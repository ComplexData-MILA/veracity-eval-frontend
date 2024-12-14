
import { useTranslations } from "next-intl";
import styles from "./input.module.scss";
import Image from 'next/image';


type Props = {
  setClaim: (arg0: string) => void;
  verifyClaim: () => void;
};

export default function Input({setClaim, verifyClaim}: Props) {

  const t = useTranslations('chatpage');

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    verifyClaim();
}

  return (
    <form className={styles.inputWrapper} onSubmit={handleSubmit}>
                <input className={styles.input} placeholder={t('inputPlaceholder')} onChange={(e) => setClaim(e.target.value)} />
                <button className={styles.submit} type="submit">
                <Image src="/assets/logoBlue.svg" alt="me" width="20" height="20" />
                </button>
              </form>
  );
}