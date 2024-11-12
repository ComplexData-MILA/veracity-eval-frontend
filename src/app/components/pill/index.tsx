import styles from "./pill.module.scss";

type Props = {
    text:string
  };

const Pill= ({ text }: Props) =>  {
    return (
        <div className={styles.pillbody}>
            <p>{text}</p>
        </div>
        );
    }     

export default Pill;