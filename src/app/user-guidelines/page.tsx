import Link from "next/link";
import styles from "./page.module.scss"
import Image from "next/image";
import { useTranslations } from "next-intl";


export default function UserGuidelines() {
  const t2 = useTranslations('chatpage')
  const t = useTranslations('guidelines')
  return (
    <>
      <main className={styles.main}>
        <Link href="/chat"><div className={styles.logoRow}>
        <Image src="/assets/logo.png" alt="me" width="20" height="20" />
        <h2 className={styles.logoTitle}>{t2('title')}</h2>
        </div></Link>
      <h1 className={styles.title}>{t2('learnMore')}</h1>
        <p>{t('introThankYou')}</p>
        <ul>
          <li>{t('guidelinesAlwaysResponse')}
            <ul>
              <li>{t('guidelinesVerifiableStatement')}</li>
              <li>{t('guidelinesSingleStatement')} <em>{t('guidelinesSingleStatementEmphasis')}</em> {t('guidelinesSingleStatementCont')}</li>
            </ul>
          </li>
          <li>{t('guidelinesLlmWrongResponse')} <strong>{t('guidelinesLlmWrongResponseStrong')}</strong> {t('guidelinesLlmWrongResponseCont')} </li>
          <li>{t('guidelinesAssessQuality')} <strong>{t('guidelinesAssessQualityStrong')}</strong> {t('guidelinesAssessQualityCont')} 
            <ol>
              <li>{t('guidelinesWellKnownStatement')}
                <ul>
                  <li><em>{t('guidelinesBreakingNewsEmphasis')}</em>: {t('guidelinesBreakingNews')}<br /><em>{t('guidelinesBreakingNewsSug')}</em> {t('guidelinesBreakingNewsCont')}</li>
                </ul>
                {t('outsideList')}
              </li>
              <li>{t('guidelinesLowCredibilitySources')}</li>
            </ol>
          </li>
          <li>{t('guidelinesResearchAndFeedback')} <strong>{t('guidelinesResearchAndFeedbackStrong')}</strong> {t('afterFeedback')}</li>
          <li>{t('guidelinesTechnicalDetails')} <Link href="/how-the-ai-works" className="special-link" target="_blank" rel="noopener noreferrer">{t('guidelinesClickHere')}</Link></li>
        </ul>
      </main>

      </>
  );
}