import Link from "next/link";
import styles from "../privacy/page.module.scss"
import Image from "next/image";
import { useTranslations } from "next-intl";


export default function HowTheAiWorks() {
  const t = useTranslations('howWorks');
  const t2 = useTranslations('chatpage')
  return (
    <>
      <main className={styles.main}>
      <Link href="/chat"> <div className={styles.logoRow}>
        <Image src="/assets/logo.png" alt="me" width="20" height="20" />
        <h2 className={styles.logoTitle}>{t2('title')}</h2>
        </div></Link>

        <h1 className={styles.title}>{t('how_ai_works_title')}</h1>
          <p>{t('how_ai_works_intro')}</p>

          <p>{t('how_ai_works_rag_explanation')}</p>

          <ol>
            <li>{t('how_ai_works_step_1')}</li>
            <li>{t('how_ai_works_step_2')}</li>
            <li>{t('how_ai_works_step_3')}{' '}<em>{t('score')}</em>{' '}{t('how_ai_works_step_3_cont')}</li>
          </ol>

          <p>{t('how_ai_works_minor_steps_intro')}</p>

          <ul>
            <li>{t('how_ai_works_minor_step_1')}</li>
            <li>{t('how_ai_works_minor_step_2')}</li>
            <li>{t('how_ai_works_minor_step_3')}</li>
          </ul>

          <p>
            {t('how_ai_works_conclusion')}{' '}
            <a href="/user-guidelines" className="special-link">{t('how_ai_works_user_guidelines_link')}</a>
            {t('how_ai_works_conclusion_continued')}
          </p>

          <p>{t('how_ai_works_academic_paper_intro')}</p>

          <p>{t('how_ai_works_academic_paper_citation')}{' '}<strong>{t('how_ai_works_academic_paper_citation_title')}</strong>{' '}{t('how_ai_works_academic_paper_citation_cont')}{' ['}<a href="https://arxiv.org/abs/2409.00009" className="special-link">{t('how_ai_works_arxiv_link')}</a>{']'}</p>

          <p>{t('how_ai_works_additional_notes')}</p>

          <ul>
            <li>
              <strong>{t('how_ai_works_why_it_works_strong')}</strong>{' '}
              {t('how_ai_works_why_it_works')}{' '}
              <a href="https://arxiv.org/pdf/2305.14928" className="special-link">{t('how_ai_works_arxiv_link')}</a>
              {' '}{t('how_ai_works_why_it_works_cont')}
            </li>
            <li>
              {t('how_ai_works_source_reliability')}{' '}
              <a href="https://www.google.com/url?q=https://doi.org/10.1093/pnasnexus/pgad286&sa=D&source=docs&ust=1738350980635922&usg=AOvVaw2L0zAoYLG6TpmtU-5y8JLS" className="special-link">
                {t('how_ai_works_domains_link')}
              </a>{'. '}{t('how_ai_works_source_reliability_cont')}
            </li>
          </ul>
      </main>
      </>
  );
}