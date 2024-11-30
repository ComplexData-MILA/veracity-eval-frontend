
import styles from "./openTab.module.scss";


type Props = {
  text:string
};

export default function OpenTab(props: Props) {


  return (
      <button className={styles.addButton}>
        {props.text}
      </button>
  );
}