"use client"

import Image from "next/image";
import AddTab from "../../components/addTab";
import styles from "../../chat/page.module.scss";
import { useState } from "react";
import UserModal from "../userModal";


export default function ControlColumn() {
  const [accountControlIsOpen, setAccountControlIsOpen] = useState(false)

  return (
    <section className={styles.controlColumn}>
          <div>
            <AddTab />
          </div>
          <div className={styles.profileWrapper}>
           <Image src="/assets/profile.png" alt="me" width="50" height="50" className={styles.profilePic} onClick={()=> setAccountControlIsOpen(true)}/>
           <p>David</p>
          </div>
          {accountControlIsOpen === true ? <UserModal setAccountControlIsOpen={setAccountControlIsOpen} /> : ""}
     </section>
  );
}