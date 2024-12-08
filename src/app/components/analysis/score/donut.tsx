import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
import styles from "../analysis.module.scss";

Chart.register(ArcElement);


const data = {
  datasets: [
    {
      data: [55, 45],
      backgroundColor: [
        "#1683FF",
        "#ffffff",
      ],
      display: false,
      
    }
  ],
};

const Donut = () => {
  return (
    <div className={styles.donutSection}>
      <Doughnut
        data={data}
        options={{
          plugins: {
            legend: {
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
          responsive: true
        }}
      />
    <div className={styles.arcText}>
        <h2 className={styles.reliabilityLabel}>Reliability</h2>
        <h2 className={styles.reliabilityScoreLarge}>{`${data.datasets[0].data[0].toString()}%`}</h2>
    </div>
    </div>
  );
};

export default Donut;
