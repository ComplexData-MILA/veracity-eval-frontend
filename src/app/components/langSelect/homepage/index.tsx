'use client'
import { Locale } from "@/i18n/config";
import styles from "../../../page.module.scss";
import {setUserLocale} from '@/services/locale';


type Props = {
    lang: Locale
  };

const LangSwitcherHome= ({ lang }: Props) =>  {
    return (
        <div className={styles.headerItem} onClick={()=>setUserLocale(lang)}>
            <p>{lang}</p>
        </div>
        );
    }     

export default LangSwitcherHome;
