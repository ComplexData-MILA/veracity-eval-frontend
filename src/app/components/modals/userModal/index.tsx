
import Link from "next/link";
import styles from "./userModal.module.scss";
import { useRouter } from 'next/navigation';
import Image from "next/image";


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
            <li className={styles.underline} onClick={()=> setActiveModal(1)}><div className={styles.iconWrapper}><Image src="/assets/account.svg" alt="account preferences" width="20" height="20" /></div>Preferences</li>
            <li className={styles.underline} onClick={()=> setActiveModal(2)}><div className={styles.iconWrapper}><Image src="/assets/report.svg" alt="report a problem icon" width="20" height="20" /></div>Report a problem</li>
            <Link href='/privacy'><li className={styles.underline}><div className={styles.iconWrapper}><Image src="/assets/privacy.svg" alt="privacy policy icon" width="20" height="20" /></div>Privacy Policy & Terms of Service</li></Link>
            <Link href='/how-the-ai-works'><li className={styles.underline}><div className={styles.iconWrapper}><Image src="/assets/guide.svg" alt="user guide icon" width="20" height="20" /></div>How the AI works</li></Link>
            <li onClick={()=> router.push(`/api/auth/logout?returnTo=/`)}><div className={styles.iconWrapper}><Image src="/assets/logout.svg" alt="logout icon" width="20" height="20" /></div>Logout</li>
          </ul>
          
          </div>
          <div className={styles.littleTriangle} />
      </div>
  );
}

export default UserModal;