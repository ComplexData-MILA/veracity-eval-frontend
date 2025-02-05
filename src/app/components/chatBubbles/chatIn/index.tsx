
import styles from "../chatBubbles.module.scss";
import Image from 'next/image';


type Props = {
  text:string
};

export default function ChatIn(props: Props) {

  return (
      <div className={styles.chatRow}>
        <Image src={'/assets/logo.png'} alt='veri-fact logo' height={40} width={40} />
        <div className={styles.chatBubbleIn}>
          {props.text === "..." ? <Image src={'/assets/loadingCropped.gif'} alt='veri-fact logo' height={20} width={20} /> : 
          <p>{props.text}</p>
          }
        </div>
      </div>
  );
}