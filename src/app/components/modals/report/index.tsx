import Image from "next/image";
import styles from "../secondaryModal.module.scss";


type Props = {
  setActiveModal: (arg0: number) => void;
};


const PreferencesModal = ({ setActiveModal }: Props) => {


  return (
      <div className={styles.tintedWrapper} onClick={()=> setActiveModal(0)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.exitWrapper} onClick={()=> setActiveModal(0)}>
          <Image src="/assets/close.svg" alt="close" width="20" height="20" />
          </div>
          <h2 className={styles.modalTitle}>Report a problem</h2>
          <textarea className={styles.problemInput} placeholder="Please include as much info as possible..." />
          <div className={styles.problemButtonRow}>
            <button className={styles.problemCancel}>Cancel</button>
            <button className={styles.problemSubmit}>Submit</button>
          </div>
        </div>
      </div>
  );
}

export default PreferencesModal;