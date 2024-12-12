import ChatWindow from "../components/chatWindow";
import ControlColumn from "../components/controlColumn";
import styles from "./page.module.scss";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.mainWrapper}>
        <ControlColumn />
        <ChatWindow />
      </main>
    </div>
  );
}
