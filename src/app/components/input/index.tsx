
import styles from "./input.module.scss";
import Image from 'next/image';


export default function Input() {


  return (
    <div className={styles.inputWrapper}>
                <input className={styles.input} placeholder="Start typing or share a link" />
                <button className={styles.submit}>
                <Image src="/assets/logoBlue.svg" alt="me" width="20" height="20" />
                </button>
              </div>
  );
}