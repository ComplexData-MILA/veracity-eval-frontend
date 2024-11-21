import AddTab from "../components/addTab";
import ChatWindow from "../components/chatWindow";
import SourceWindow from "../components/sourceWindow";
import styles from "./page.module.scss";
import Image from "next/image";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.mainWrapper}>
        <section className={styles.controlColumn}>
          <div>
            <AddTab />
          </div>
          <div className={styles.profileWrapper}>
           <Image src="/assets/profile.png" alt="me" width="50" height="50" />
          </div>
        </section>
          <ChatWindow />

        <SourceWindow />
        
      
      </main>
    </div>
  );
}
