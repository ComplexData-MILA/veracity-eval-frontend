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
          <p>{t('reliabilityScoreDescription')}</p>
        </div>

        </div>
      </div>
  );
}

export default ScoreInfo;