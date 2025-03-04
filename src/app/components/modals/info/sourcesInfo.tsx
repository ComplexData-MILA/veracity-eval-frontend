import styles from "../secondaryModal.module.scss";
import { useTranslations } from "next-intl";

type Props = {
  setActiveModal: (arg0: number) => void;
};


const SourcesInfo = ({ setActiveModal }: Props) => {
  const t = useTranslations('sourceInfo'); 

  return (
      <div className={styles.clearWrapper} onClick={()=> setActiveModal(0)}>
        <div className={styles.modalTwo} onClick={e => e.stopPropagation()}>
        <div>
          <h4>{t('whatIsSource')}</h4>
          <p>{t('sourceDefinition')}</p>
          <h4>{t('howDoesVeracityCurate')}</h4>
          <p>{t('sourceCuration')}</p>
        </div>
        </div>
      </div>
  );
}

export default SourcesInfo;