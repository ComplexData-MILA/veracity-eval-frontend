"use client"

import styles from "./analysis.module.scss";

type Props = {
  text: string;
  id: number;
  activeLabels: boolean[]
  handleLabelToggle: (arg0: number) => void;
};

export default function LabelButton({ text, id, activeLabels, handleLabelToggle }: Props) {
  return (
    <button className={activeLabels[id]===true ? styles.active : styles.inactive} onClick={()=> handleLabelToggle(id)}>{text}</button>
  );
}