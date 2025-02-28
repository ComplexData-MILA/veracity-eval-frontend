import styles from "../../chat/page.module.scss";
import { useTranslations } from "next-intl";


export default function HelpWindow() {
  const t = useTranslations('help');
  return (
    <section className={styles.helpSection}>
      <h2 className={styles.helpHeading}>{t('helpSectionTitle')}</h2>
      <p className={styles.helpText}>{t('question1')}</p>
      <p className={styles.helpTextResponse}>{t('answer1')}</p>
      <p className={styles.helpText}>{t('question2')}</p>
      <p className={styles.helpTextResponse}>{t('answer2')}</p>
      <p className={styles.helpText}>{t('question3')}</p>
      <p className={styles.helpTextResponse}>{t('answer3')}</p>
      <p className={styles.helpText}>{t('question4')}</p>
      <p className={styles.helpTextResponse}>{t('answer4')}</p>
      <p className={styles.helpText}>{t('question5')}</p>
      <p className={styles.helpTextResponse}>{t('answer5')}</p>
      <p className={styles.helpText}>{t('question6')}</p>
      <p className={styles.helpTextResponse}>{t('answer6')}</p>
      <p className={styles.helpText}>{t('question7')}</p>
      <p className={styles.helpTextResponse}>{t('answer7')}</p>
    </section>
  );
}