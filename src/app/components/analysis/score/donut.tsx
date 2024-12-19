import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
import styles from "../analysis.module.scss";

Chart.register(ArcElement);

type Props = {
  reliability: number;
};

const Donut = ({reliability}: Props) => {
  return (
    <div className={styles.donutSection}>
      <Doughnut
        data={{
          datasets: [
            {
              data: [reliability, (100-reliability)],
              backgroundColor: [
                "#1683FF",
                "#ffffff",
              ]
            }
          ],
        }}
        options={{
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          },
          rotation: -90,
          circumference: 180,
          cutout: "90%",
          maintainAspectRatio: true,
          responsive: false
        }}
      />
    <div className={styles.arcText}>
        <h2 className={styles.reliabilityLabel}>Reliability</h2>
        <h2 className={styles.reliabilityScoreLarge}>{`${reliability.toString()}%`}</h2>
    </div>
    </div>
  );
};

export default Donut;
