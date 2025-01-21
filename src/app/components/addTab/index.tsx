
import styles from "./addTab.module.scss";
import Image from 'next/image';


export default function AddTab() {


  return (
      <button className={styles.addButton} onClick={()=>window.location.reload()}>
        <Image src="/assets/refresh.svg" alt="me" width="20" height="20" />
      </button>
  );
}