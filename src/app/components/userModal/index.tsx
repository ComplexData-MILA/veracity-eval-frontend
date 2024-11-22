
import Link from "next/link";
import styles from "./userModal.module.scss";


type Props = {
  setAccountControlIsOpen: (arg0: boolean) => void;
};


const UserModal = ({ setAccountControlIsOpen }: Props) => {


  return (
      <div className={styles.tintedWrapper} onClick={()=> setAccountControlIsOpen(false)}>
        <div className={styles.menu}>
          <ul className={styles.linkList}>
            <li>Preferences</li>
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