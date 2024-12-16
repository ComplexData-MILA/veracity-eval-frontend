import styles from "../chatBubbles.module.scss";
import { getUserPhoto } from "@/app/hooks/getUserPhoto";




type Props = {
  text:string
};

export default function ChatOut(props: Props) {

  return (
      <div className={styles.chatRowReverse}>
        <div className={styles.chatBubbleOut}>
          <p>{props.text}</p>
        </div>
        <img className={styles.profilePic} src={getUserPhoto()} alt="me" width="40" height="40" />
      </div>
  );
}