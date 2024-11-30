import Image from "next/image";
import styles from "../secondaryModal.module.scss";
import { setUserLocale } from "@/services/locale";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n/config";


type Props = {
  setActiveModal: (arg0: number) => void;
};


const ReportModal = ({ setActiveModal }: Props) => {

  const locale = useLocale();
  const [lang, setLang] = useState(locale)
  const t = useTranslations('chatpage');

  function handleChange(value: string){
    setLang(value);
    setUserLocale(value as Locale);
  }

  return (
      <div className={styles.tintedWrapper} onClick={()=> setActiveModal(0)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.exitWrapper} onClick={()=> setActiveModal(0)}>
          <Image src="/assets/close.svg" alt="close" width="20" height="20" />
          </div>
          <h2 className={styles.modalTitle}>{t('preferences')}</h2>
          <div className={styles.modalRow}>
            <div>
              <h3 className={styles.rowTitle}>{t('language')}</h3>
              <p className={styles.rowDescription}>{t('languageDescription')}</p>
            </div>
            <select name="language" id="language-select" value={lang} onChange={(e)=>handleChange(e.target.value)}>\
            <option value="en">English</option>
            <option value="fr">Francais</option>
            </select>
          </div>
          <div className={styles.modalRow}>
            <div>
                <h3 className={styles.rowTitle}>Time Zone</h3>
                <p className={styles.rowDescription}>Current time zone setting</p>
              </div>
              <p className={styles.timeZone}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            </div>
            <button onClick={()=> setActiveModal(0)}>OK</button>
          </div>
          
      </div>
  );
}

export default ReportModal;