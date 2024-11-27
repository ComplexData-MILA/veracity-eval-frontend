import Image from "next/image";
import styles from "../secondaryModal.module.scss";


type Props = {
  setActiveModal: (arg0: number) => void;
};


const ReportModal = ({ setActiveModal }: Props) => {


  return (
      <div className={styles.tintedWrapper} onClick={()=> setActiveModal(0)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.exitWrapper} onClick={()=> setActiveModal(0)}>
          <Image src="/assets/close.svg" alt="close" width="20" height="20" />
          </div>
          <h2 className={styles.modalTitle}>Preferences</h2>
          <div className={styles.modalRow}>
            <div>
              <h3 className={styles.rowTitle}>Language</h3>
              <p className={styles.rowDescription}>Change the language used in the user interface</p>
            </div>
            <select name="language" id="language-select">\
            <option value="english">English</option>
            <option value="english">Francais</option>
            </select>
          </div>
          <div className={styles.modalRow}>
          <div>
              <h3 className={styles.rowTitle}>Time Zone</h3>
              <p className={styles.rowDescription}>Current time zone setting</p>
            </div>
            <p className={styles.timeZone}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
          </div>
        </div>
      </div>
  );
}

export default ReportModal;