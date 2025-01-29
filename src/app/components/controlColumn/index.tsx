"use client"

import AddTab from "../../components/addTab";
import styles from "../../chat/page.module.scss";
import { useState } from "react";
import UserModal from "../modals/userModal";
import PreferencesModal from "../modals/preferences";
import ReportModal from "../modals/report";
import { GetUserFirstName, GetUserPhoto } from "@/services/getUserPhoto";


export default function ControlColumn() {
  const [accountControlIsOpen, setAccountControlIsOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(0)

  return (
    <section className={styles.controlColumn}>
          <div className={styles.tabSection}>
            <AddTab />
          </div>
          <div className={styles.profileWrapper}>
            <img src={GetUserPhoto()} alt="Profile Picture" width="50" height="50" className={styles.profilePic} onClick={()=> setAccountControlIsOpen(true)}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src="/assets/profile.svg";
            }}/>
            <p>{GetUserFirstName()}</p>
          </div>
          {accountControlIsOpen === true ? <UserModal setAccountControlIsOpen={setAccountControlIsOpen} setActiveModal={setActiveModal} /> : ""}
          {activeModal === 1 ? <PreferencesModal setActiveModal={setActiveModal} />: ""}
          {activeModal === 2 ? <ReportModal setActiveModal={setActiveModal} />: ""}
     </section>
  );
}