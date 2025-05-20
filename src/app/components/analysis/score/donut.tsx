import { Chart, ArcElement } from "chart.js";
import styles from "../analysis.module.scss";
import { useTranslations } from "next-intl";

Chart.register(ArcElement);

type Props = {
  reliability: number;
  colour: string;
};

const Donut = ({reliability}: Props) => {
  const t = useTranslations('chatpage');
  return (
    <div className={styles.donutSection}>
    <div className={styles.arcText}>
        <h2 className={styles.reliabilityLabel}>{t('reliability')}</h2>
        <h2 className={styles.reliabilityScoreLarge}>{`${reliability.toString()}%`}</h2>
    </div>
    </div>
  );
};

export default Donut;
