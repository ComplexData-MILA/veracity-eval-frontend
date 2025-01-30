"use client"

import styles from "../page.module.scss"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
  } from 'chart.js';

  import { Bar } from 'react-chartjs-2';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
);

export const options = {
responsive: true,
plugins: {
    legend: {
        display: false,
        }
    }
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October', 'November', 'December'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Reliability over time',
      data: labels.map(() => Math.random()*Math.random()*100),
      borderColor: '#1683FF',
      backgroundColor: '#11F90E',
    },
  ],
};

export default function Distribution() {
    return (
         <div className={styles.mockTile}>
            <h2 className={styles.title}>Distribution of reliability score count per %</h2>
            <div className={styles.chartWrapper}>
                <Bar options={options} data={data} />
            </div>
        </div>
);
}