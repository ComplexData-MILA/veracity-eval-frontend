import Link from "next/link";
import styles from "./page.module.scss"
import Image from "next/image";
import { useTranslations } from "next-intl";


export default function Privacy() {

    const t = useTranslations('privacy');
    const t2 = useTranslations('chatpage');
    return (
    <>
      <main className={styles.main}>
    <Link href="/chat"><div className={styles.logoRow}>
        <Image src="/assets/logo.png" alt="me" width="20" height="20" />
        <h2 className={styles.logoTitle}>{t2('title')}</h2>
    </div></Link>
    {/*<!--Privacy section-->*/}
    <h1 className={styles.title}>{t('PrivacyPolicyTitle')}</h1>
    <p><b>{t('EffectiveDate')}</b> {t('March31_2025')}
        <br />
        {t('PrivacyPolicyIntro')}
    </p>
    <h2 className={styles.contentTitle}>{t('InformationWeCollectTitle')}</h2>
    <p>{t('InformationTypesIntro')}</p>
    <h3 className={styles.contentSubtitle}>{t('PersonalInformationTitle')}</h3>
    <p>{t('PersonalInformationIntro')}</p>
    <ul>
        <li>{t('EmailAddress')}</li>
        <li>{t('InformationProvidedInApp')}</li>
    </ul>
    <h3 className={styles.contentSubtitle}>{t('NonPersonalInformationTitle')}</h3>
    <p>{t('NonPersonalInformationIntro')}</p>
    <ul>
        <li>{t('IPAddress')}</li>
        <li>{t('BrowserType')}</li>
        <li>{t('DeviceInformation')}</li>
    </ul>
    <h2 className={styles.contentTitle}>{t('HowWeUseYourInformationTitle')}</h2>
    <p>{t('HowWeUseYourInformationIntro')}</p>
    <ul>
        <li>{t('ProvidingAndImprovingServices')}</li>
        <li>{t('ProvidingAggregateInfo')}</li>
        <li>{t('RespondingToInquiries')}</li>
        <li>{t('SendingUpdatesAndPromotions')}</li>
        <li>{t('EnsuringSecurity')}</li>
    </ul>
    <h2 className={styles.contentTitle}>{t('SharingYourInformationTitle')}</h2>
    <p>
        {t('NoSaleOfPersonalInformation')} {t('SharingInformationCircumstances')}
    </p>
    <ul>
        <li>{t('RequiredByLaw')}</li>
        <li>{t('ProtectingRightsAndSafety')}</li>
    </ul>
    <h2 className={styles.contentTitle}>{t('CookiesAndTrackingTechnologiesTitle')}</h2>
    <p>{t('CookiesUsageIntro')}</p>
    <ul>
        <li>{t('EssentialCookies')}</li>
    </ul>
    <p>{t('CookieManagement')}</p>
    <h2 className={styles.contentTitle}>{t('DataSecurityTitle')}</h2>
    <p>{t('DataSecurityIntro')}</p>
    <h2 className={styles.contentTitle}>{t('YourRightsTitle')}</h2>
    <p>{t('RightsIntro')}</p>
    <ul>
        <li>{t('AccessToInformation')}</li>
        <li>{t('RequestCorrections')}</li>
        <li>{t('RequestDeletion')}</li>
        <li>{t('OptOutOfMarketing')}</li>
    </ul>
    <p>{t('ContactForRights')}</p>
    <h2 className={styles.contentTitle}>{t('ThirdPartyLinksTitle')}</h2>
    <p>{t('ThirdPartyLinksIntro')}</p>
    <h2 className={styles.contentTitle}>{t('ChangesToPrivacyPolicyTitle')}</h2>
    <p>
        {t('PrivacyPolicyUpdateIntro')}
    </p>
    <h2 className={styles.contentTitle}>{t('ContactUsTitle')}</h2>
    <p>
        {t('QuestionsOrConcernsIntro')} <a href="mailto:taylor.curtis@mila.quebec" className="special-link"><u>{t('ContactEmail')}</u></a>
    </p>
    {/*<!--TOS section-->*/}
    <h1 className={styles.title}>{t('TermsOfServiceTitle')}</h1>
    <p><strong>{t('EffectiveDate')}</strong> {t('March31_2025')}</p>
    <p>{t('TermsOfServiceIntro')}</p>
    <h2 className={styles.contentTitle}>{t('AcceptanceOfTermsTitle')}</h2>
    <p>{t('AcceptanceOfTermsIntro')}</p>
    <h2 className={styles.contentTitle}>{t('UseOfServiceTitle')}</h2>
    <p>{t('UseOfServiceIntro')}</p>
    <ul>
        <li>{t('ViolationOfLaws')}</li>
        <li>{t('MaliciousCode')}</li>
        <li>{t('ReverseEngineering')}</li>
        <li>{t('MisuseOfService')}</li>
    </ul>
    <h2 className={styles.contentTitle}>{t('AccountRegistrationAndSecurityTitle')}</h2>
    <p>{t('AccountRegistrationIntro')}</p>
    <ul>
        <li>{t('AccurateInformation')}</li>
        <li>{t('Confidentiality')}</li>
        <li>{t('NotifyUnauthorizedUse')}</li>
    </ul>
    <h2 className={styles.contentTitle}>{t('ContentOwnershipAndLicensingTitle')}</h2>
    <ul>
        <li><strong>{t('YourContentTitle')}:</strong> {t('YourContentIntro')}</li>
        <li><strong>{t('OurContentTitle')}:</strong> {t('OurContentIntro')}</li>
    </ul>
    <h2 className={styles.contentTitle}>{t('PrivacyTitle')}</h2>
    <p>{t('PrivacyIntro')}</p>
    <h2 className={styles.contentTitle}>{t('DisclaimersAndLimitationsOfLiabilityTitle')}</h2>
    <ul>
        <li>{t('ServiceAsIs')}</li>
        <li>{t('AccuracyAndReliability')}</li>
        <li>{t('LimitationOfLiability')}</li>
    </ul>
    <h2 className={styles.contentTitle}>{t('TerminationTitle')}</h2>
    <p>{t('TerminationIntro')}</p>
    <h2 className={styles.contentTitle}>{t('ChangesToTermsTitle')}</h2>
    <p>{t('TermsUpdateIntro')}</p>
    <h2 className={styles.contentTitle}>{t('GoverningLawAndDisputesTitle')}</h2>
    <p>{t('GoverningLawIntro')}</p>
    <h2 className={styles.contentTitle}>{t('ContactInformationTitle')}</h2>
    <p>{t('ContactIntro')}</p>
    <p>{t('ContactEmailTitle')} <a href="mailto:taylor.cutis@mila.quebec" className="special-link">{t('ContactEmail')}</a></p>
    </main>
    </>
  );
}