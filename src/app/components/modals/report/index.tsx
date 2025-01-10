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
          <iframe className={styles.problemIframe} src="https://forms.gle/qfEzuEekeqZ9GQoq9" width="100%" height="450" />
        </div>
      </div>
  );
}

export default PreferencesModal;