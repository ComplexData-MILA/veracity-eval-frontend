import { useUser } from "@auth0/nextjs-auth0/client";
import styles from "../chatBubbles.module.scss";




type Props = {
  text:string
};

export default function ChatOut(props: Props) {
  const { user } = useUser();

  return (
      <div className={styles.chatRowReverse}>
        <div className={styles.chatBubbleOut}>
          <p>{props.text}</p>
        </div>
        {//@ts-expect-error user void case not handled yet
        }<img src={user?user.picture:"/assets/profile.svg"} alt="me" width="40" height="40" />
      </div>
  );
}