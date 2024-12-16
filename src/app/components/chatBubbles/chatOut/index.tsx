import styles from "../chatBubbles.module.scss";
import { GetUserPhoto } from "@/services/getUserPhoto";




type Props = {
  text:string
};

export default function ChatOut(props: Props) {

  return (
      <div className={styles.chatRowReverse}>
        <div className={styles.chatBubbleOut}>
          <p>{props.text}</p>
        </div>
        <img className={styles.profilePic} src={GetUserPhoto()} alt="me" width="40" height="40" />
      </div>
  );
}