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

const labels = ['1 star', '2 star', '3 star', '4 star', '5 star'];

export const data = {
labels,
datasets: [
  {
    label: 'Reliability over time',
    data: labels.map(() => Math.random()*Math.random()*100),
    borderColor: '#1683FF',
    backgroundColor: '#1683FF',
  },
],
};

export default function ReliabilityMatrix() {
    return (
         <div className={styles.mockTile}>
            <h2 className={styles.title}>Rating - Reliability score matrix</h2>
            <div className={styles.chartWrapper} style={{marginTop: '0px'}}>
                <h3 className={styles.subtitle}>Higher reliability score attained</h3>
                <h4 className={styles.giantNumber}>50%</h4>
                <Bar options={options} data={data} />
            </div>
        </div>
);
}