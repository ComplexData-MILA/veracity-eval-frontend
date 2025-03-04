
import { useTranslations } from "next-intl";
import styles from "./help.module.scss";
import Image from 'next/image';



type Props = {
  helpIsOpen: boolean;
  setHelpIsOpen: (arg0: boolean) => void;
};
const Help = ({ helpIsOpen, setHelpIsOpen }: Props) => {
  const t = useTranslations('chatpage');
  return (
    <div className={styles.helpWrapper}>
      <button className={styles.helpButton} onClick={()=> setHelpIsOpen(true)}>
        <Image src="/assets/help.svg" alt="me" width="20" height="20" />
        <p>{t('help')}</p>
      </button>
      {helpIsOpen === true ? <button className={styles.close} onClick={()=> setHelpIsOpen(false)}>{t('close')}</button> : ""}
     </div>
  );
}

export default Help;