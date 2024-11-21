
import styles from "./addTab.module.scss";
import Image from 'next/image';


export default function AddTab() {


  return (
      <button className={styles.addButton}>
        <Image src="/assets/newTab.svg" alt="me" width="20" height="20" />
      </button>
  );
}