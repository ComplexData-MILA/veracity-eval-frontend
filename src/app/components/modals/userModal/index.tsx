
import Link from "next/link";
import styles from "./userModal.module.scss";


type Props = {
  setAccountControlIsOpen: (arg0: boolean) => void;
  setActiveModal: (arg0: number) => void;
};


const UserModal = ({ setAccountControlIsOpen, setActiveModal }: Props) => {


  return (
      <div className={styles.tintedWrapper} onClick={()=> setAccountControlIsOpen(false)}>
        <div className={styles.menu} onClick={e => e.stopPropagation()}>
          <ul className={styles.linkList}>
            <li onClick={()=> setActiveModal(1)}>Preferences</li>
            <li onClick={()=> setActiveModal(2)}>Report a problem</li>
          </ul>
          <ul className={styles.linkList}>
            <Link href='/privacy'><li>Privacy Policy</li></Link>
            <Link href='/privacy'><li>Terms of Service</li></Link>
            <Link href='/privacy'><li>Compliance Policy</li></Link>
            <Link href='/privacy'><li>User Guidelines</li></Link>
          </ul>
          <ul className={styles.linkListLast}>
            <li>Logout</li>
          </ul>
          
          </div>
          <div className={styles.littleTriangle} />
      </div>
  );
}

export default UserModal;