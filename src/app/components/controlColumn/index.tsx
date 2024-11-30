"use client"

import Image from "next/image";
import AddTab from "../../components/addTab";
import styles from "../../chat/page.module.scss";
import { useState } from "react";
import UserModal from "../modals/userModal";
import PreferencesModal from "../modals/preferences";
import ReportModal from "../modals/report";
import OpenTab from "../openTab";


export default function ControlColumn() {
  const [accountControlIsOpen, setAccountControlIsOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(0)

  return (
    <section className={styles.controlColumn}>
          <div>
            <AddTab />
          </div>
          <div className={styles.profileWrapper}>
           <Image src="/assets/profile.png" alt="me" width="50" height="50" className={styles.profilePic} onClick={()=> setAccountControlIsOpen(true)}/>
           <p>David</p>
          </div>
          {accountControlIsOpen === true ? <UserModal setAccountControlIsOpen={setAccountControlIsOpen} setActiveModal={setActiveModal} /> : ""}
          {activeModal === 1 ? <PreferencesModal setActiveModal={setActiveModal} />: ""}
          {activeModal === 2 ? <ReportModal setActiveModal={setActiveModal} />: ""}
     </section>
  );
}