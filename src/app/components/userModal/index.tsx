
import styles from "./userModal.module.scss";


type Props = {
  setAccountControlIsOpen: (arg0: boolean) => void;
};


const UserModal = ({ setAccountControlIsOpen }: Props) => {


  return (
      <div className={styles.tintedWrapper} onClick={()=> setAccountControlIsOpen(false)}>
        <div className={styles.menu}>
          <ul>
            <li>Account Management</li>
            <li>menu item</li>
            <li>menu item</li>
            <li>menu item</li>
            <li>menu item</li>
            <li>menu item</li>
            <li>menu item</li>
            <li>menu item</li>
          </ul>
          </div>
      </div>
  );
}

export default UserModal;