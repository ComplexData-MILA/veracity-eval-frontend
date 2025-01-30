"use client"

import styles from "../page.module.scss"
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export type Position = "top" | "bottom" | "center" | "left" | "right";
const legendPosition: Position = "bottom"

export const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
        position: legendPosition,
    }
}
};

export const data = {
  datasets: [
    {
      label: 'The earth is flat',
      data: Array.from({ length: 100 }, () => ({
        x: Math.random()*23+Math.random()*6,
        y: Math.random()*30+Math.random()*8,
      })),
      backgroundColor: 'black',
    },
    {
        label: 'Vaccines cause autism',
        data: Array.from({ length: 100 }, () => ({
          x: ((Math.random()*100+30)%50+50),
          y: Math.random()*10+Math.random()*40+20,
        })),
        backgroundColor: '#1683FF',
      },
      {
        label: 'Aliens have landed in New Jersey',
        data: Array.from({ length: 100 }, () => ({
            x: Math.random()*43+Math.random()*6,
            y: Math.random()*50+Math.random()*10+40,
        })),
        backgroundColor: '#11F90E',
      },
  ],
};


export default function ClusterTile() {
    return (
         <div className={styles.mockTile}>
            <h2 className={styles.title}>Similarity cluster analysis</h2>
            <p className={styles.subtitle}>Cluster analysis identifies patterns using embeddings for similarity grouping.</p>
            <div className={styles.chartWrapper}>
                <Scatter options={options} data={data} />
            </div>
        </div>
);
}