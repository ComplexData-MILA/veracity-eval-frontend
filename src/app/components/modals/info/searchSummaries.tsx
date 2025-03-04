import styles from "../secondaryModal.module.scss";
import { useTranslations } from "next-intl";

type Props = {
  setActiveModal: (arg0: number) => void;
};


const SearchSummariesModal = ({ setActiveModal }: Props) => {
  const t = useTranslations('searchSummaries'); 

  return (
      <div className={styles.clearWrapper} onClick={()=> setActiveModal(0)}>
        <div className={styles.modalOne} onClick={e => e.stopPropagation()}>
        <div>
          <h4>{t('whatAreAISearchSummaries')}</h4>
          <p>{t('aiSearchSummariesDefinition')}</p>
        </div>
        </div>
      </div>
  );
}

export default SearchSummariesModal;