"use client"

import AddTab from "../../components/addTab";
import styles from "../../chat/page.module.scss";
import { useState } from "react";
import UserModal from "../modals/userModal";
import PreferencesModal from "../modals/preferences";
import ReportModal from "../modals/report";
import { useUser } from '@auth0/nextjs-auth0/client';


export default function ControlColumn() {
  const [accountControlIsOpen, setAccountControlIsOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(0)
  const { user } = useUser();

  return (
    <section className={styles.controlColumn}>
          <div className={styles.tabSection}>
            <AddTab />
          </div>
          <div className={styles.profileWrapper}>
           <img src={user?user.picture:"/assets/profile.svg"} alt="me" width="50" height="50" className={styles.profilePic} onClick={()=> setAccountControlIsOpen(true)}/>
           <p>{user?user.name.split(" ")[0]:""}</p>
          </div>
          {accountControlIsOpen === true ? <UserModal setAccountControlIsOpen={setAccountControlIsOpen} setActiveModal={setActiveModal} /> : ""}
          {activeModal === 1 ? <PreferencesModal setActiveModal={setActiveModal} />: ""}
          {activeModal === 2 ? <ReportModal setActiveModal={setActiveModal} />: ""}
     </section>
  );
}