
import styles from "../chatBubbles.module.scss";
import Image from 'next/image';


type Props = {
  text:string
};

export default function ChatOut(props: Props) {

  return (
      <div className={styles.chatRowReverse}>
        <div className={styles.chatBubbleOut}>
          <p>{props.text}</p>
        </div>
        <Image src={'/assets/profile.png'} alt='veri-fact logo' height={40} width={40} />
      </div>
  );
}