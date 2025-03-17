"use client"

import React, { useEffect, useState } from "react";
import styles from "../page.module.scss"
import { useAuthApi } from "@/app/hooks/useAuthApi";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

//@ts-expect-error: Necessary because TypeScript incorrectly infers the type here
import Plot from "react-plotly.js";
import { API_URL} from "@/app/constants";

interface ClusteringProps {
    startDate: Date | null;
    endDate: Date | null;
}

interface ClusteringGraph {
  data: {
      hovertemplate: string;
      legendgroup: string;
      marker: {
          color: string;
          symbol: string;
      };
      mode: string;
      name: string;
      orientation: string;
      showlegend: boolean;
      x: { dtype: string; bdata: string };
      xaxis: string;
      y: { dtype: string; bdata: string };
      yaxis: string;
      type: string;
  }[];
  layout: {
      template: {
          data: {
              scatter: {
                  fillpattern?: {
                      fillmode: string;
                      size: number;
                      solidity: number;
                  };
                  type: string;
              }[];
          };
          layout: {
              annotationdefaults: {
                  arrowcolor: string;
                  arrowhead: number;
                  arrowwidth: number;
              };
              autotypenumbers: string;
              coloraxis: {
                  colorbar: { outlinewidth: number; ticks: string };
              };
              colorscale: {
                  diverging: [number, string][];
                  sequential: [number, string][];
                  sequentialminus: [number, string][];
              };
              colorway: string[];
              font: { color: string };
              geo: {
                  bgcolor: string;
                  lakecolor: string;
                  landcolor: string;
                  showlakes: boolean;
                  showland: boolean;
                  subunitcolor: string;
              };
              hoverlabel: { align: string };
              hovermode: string;
              mapbox: { style: string };
              paper_bgcolor: string;
              plot_bgcolor: string;
              polar: {
                  angularaxis: { gridcolor: string; linecolor: string; ticks: string };
                  bgcolor: string;
                  radialaxis: { gridcolor: string; linecolor: string; ticks: string };
              };
              scene: {
                  xaxis: {
                      automargin?: boolean;
                      gridcolor?: string;
                      linecolor?: string;
                      ticks?: string;
                      title?: { standoff?: number; text?: string };
                      zerolinecolor?: string;
                      zerolinewidth?: number;
                      domain?: [number, number];
                      anchor?: string;
                  };
                  yaxis: {
                      automargin?: boolean;
                      gridcolor?: string;
                      linecolor?: string;
                      ticks?: string;
                      title?: { standoff?: number; text?: string };
                      zerolinecolor?: string;
                      zerolinewidth?: number;
                      domain?: [number, number];
                      anchor?: string;
                  };
                  zaxis: {
                      automargin?: boolean;
                      gridcolor?: string;
                      linecolor?: string;
                      ticks?: string;
                      title?: { standoff?: number; text?: string };
                      zerolinecolor?: string;
                      zerolinewidth?: number;
                      domain?: [number, number];
                      anchor?: string;
                  };
              };
              shapedefaults: { line: { color: string } };
              ternary: {
                  aaxis: { gridcolor: string; linecolor: string; ticks: string };
                  baxis: { gridcolor: string; linecolor: string; ticks: string };
                  bgcolor: string;
                  caxis: { gridcolor: string; linecolor: string; ticks: string };
              };
              title: { x: number };
              xaxis: {
                  automargin?: boolean;
                  gridcolor?: string;
                  linecolor?: string;
                  ticks?: string;
                  title?: { standoff?: number; text?: string };
                  zerolinecolor?: string;
                  zerolinewidth?: number;
                  domain?: [number, number];
                  anchor?: string;
              };
              yaxis: {
                  automargin?: boolean;
                  gridcolor?: string;
                  linecolor?: string;
                  ticks?: string;
                  title?: { standoff?: number; text?: string };
                  zerolinecolor?: string;
                  zerolinewidth?: number;
                  domain?: [number, number];
                  anchor?: string;
              };
          };
      };
      xaxis: {
          automargin?: boolean;
          gridcolor?: string;
          linecolor?: string;
          ticks?: string;
          title?: { standoff?: number; text?: string };
          zerolinecolor?: string;
          zerolinewidth?: number;
          domain?: [number, number];
          anchor?: string;
      };
      yaxis: {
          automargin?: boolean;
          gridcolor?: string;
          linecolor?: string;
          ticks?: string;
          title?: { standoff?: number; text?: string };
          zerolinecolor?: string;
          zerolinewidth?: number;
          domain?: [number, number];
          anchor?: string;
      };
      legend: {
          title: { text: string };
          tracegroupgap: number;
      };
      title: { text: string };
  };
}


// ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

// export type Position = "top" | "bottom" | "center" | "left" | "right";
// const legendPosition: Position = "bottom"

// export const options = {
//   scales: {
//     y: {
//       beginAtZero: true,
//     },
//   },
//   plugins: {
//     legend: {
//         position: legendPosition,
//     }
// }
// };

// export const data = {
//   datasets: [
//     {
//       label: 'The earth is flat',
//       data: Array.from({ length: 100 }, () => ({
//         x: Math.random()*23+Math.random()*6,
//         y: Math.random()*30+Math.random()*8,
//       })),
//       backgroundColor: 'black',
//     },
//     {
//         label: 'Vaccines cause autism',
//         data: Array.from({ length: 100 }, () => ({
//           x: ((Math.random()*100+30)%50+50),
//           y: Math.random()*10+Math.random()*40+20,
//         })),
//         backgroundColor: '#1683FF',
//       },
//       {
//         label: 'Aliens have landed in New Jersey',
//         data: Array.from({ length: 100 }, () => ({
//             x: Math.random()*43+Math.random()*6,
//             y: Math.random()*50+Math.random()*10+40,
//         })),
//         backgroundColor: '#11F90E',
//       },
//   ],
// };


// export default function ClusterTile() {
//     return (
//          <div className={styles.mockTile}>
//             <h2 className={styles.title}>Similarity cluster analysis</h2>
//             <p className={styles.subtitle}>Cluster analysis identifies patterns using embeddings for similarity grouping.</p>
//             <div className={styles.chartWrapper}>
//                 <Scatter options={options} data={data} />
//             </div>
//         </div>
// );
// }

const ClusterTile: React.FC<ClusteringProps> = ({ startDate, endDate }) => {
  const [data, setData] = useState<ClusteringGraph | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth} = useAuthApi();

  useEffect(() => {
      const fetchWordCloud = async () => {
          if (startDate && endDate) {
              try {
                const response = await fetchWithAuth(
                  `${API_URL}/v1/claims/clustering/generate`,
                  {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                      start_date: startDate.toISOString(),
                      end_date: endDate.toISOString(),
                      language: "english"
                    })
                  }
                );
      
                if (!response.ok) {
                  throw new Error(`Failed to fetch data: ${await response.text()}`);
                }
      
                const data = await response.json();
                setData(data); // Parse and set Plotly JSON data
              } catch (err) {
                  console.error('Error fetching sources:', err);
                  setError(err instanceof Error ? err.message : 'Failed to fetch clustering');
              } finally {
                  setLoading(false);
              }
            } else {
              setError("Please select both start and end dates");
              setLoading(false);
            }
          };
      
          fetchWordCloud();
  }, [startDate, endDate, fetchWithAuth]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
      <div className={styles.mockTile}>
          <h2 className={styles.title}>Similarity cluster analysis</h2>
          <p className={styles.subtitle}>Cluster analysis identifies patterns using embeddings for similarity grouping.</p>
          {data ? (
          <Plot
              className={styles.plot}
              data={data.data}
              layout={data.layout}
          />
          ) : (
          <p>Loading...</p> // Show loading state while data is null
      )}
      </div>

  );
};

export default ClusterTile;