
import Link from "next/link";
import styles from "./userModal.module.scss";
import { useRouter } from 'next/navigation';


type Props = {
  setAccountControlIsOpen: (arg0: boolean) => void;
  setActiveModal: (arg0: number) => void;
};


const UserModal = ({ setAccountControlIsOpen, setActiveModal }: Props) => {
  const router = useRouter();


  return (
      <div className={styles.tintedWrapper} onClick={()=> setAccountControlIsOpen(false)}>
        <div className={styles.menu} onClick={e => e.stopPropagation()}>
          <ul className={styles.linkList}>
            <li className={styles.underline} onClick={()=> setActiveModal(1)}>Preferences</li>
            <li className={styles.underline} onClick={()=> setActiveModal(2)}>Report a problem</li>
            <Link href='/privacy'><li className={styles.underline}>Privacy Policy & Terms of Service</li></Link>
            <Link href='/user-guidelines'><li className={styles.underline}>User Guidelines</li></Link>
            <li onClick={()=> router.push(`/api/auth/logout?returnTo=/`)}>Logout</li>
          </ul>
          
          </div>
          <div className={styles.littleTriangle} />
      </div>
  );
}

export default UserModal;