import styles from "../secondaryModal.module.scss";
import { useTranslations } from "next-intl";

type Props = {
  setActiveModal: (arg0: number) => void;
};


const ScoreInfo = ({ setActiveModal }: Props) => {

  const t = useTranslations('scoreInfo');


  return (
      <div className={styles.clearWrapper} onClick={()=> setActiveModal(0)}>
        <div className={styles.modalThree} onClick={e => e.stopPropagation()}>
        <div>
          <h4>{t('whatIsReliabilityScore')}</h4>
          <p>{t('reliabilityScoreDescription')}</p>
          <ul>
            <li>{t('evidenceQuality')}</li>
            <li>{t('sourceCredibility')}</li>
            <li>{t('consistency')}</li>
            <li>{t('biasDetection')}</li>
            <li>{t('verification')}</li>
          </ul>

          <h4>{t('howDoesVeracityCalculate')}</h4>
          <p>{t('veracityCalculationExplanation')}</p>
          <p>{t('reliabilityScaleIntro')}</p>
          <p>{t('reliabilityScaleTitle')}</p>
          <ul>
            <li>{t('scale0to20')}</li>
            <li>{t('scale21to40')}</li>
            <li>{t('scale41to60')}</li>
            <li>{t('scale61to80')}</li>
            <li>{t('scale81to100')}</li>
          </ul>
        </div>

        </div>
      </div>
  );
}

export default ScoreInfo;