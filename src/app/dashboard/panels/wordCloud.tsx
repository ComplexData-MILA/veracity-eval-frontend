"use client"; 

import React, { useEffect, useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import styles from "../page.module.scss"

//@ts-expect-error: Necessary because TypeScript incorrectly infers the type here
import Plot from "react-plotly.js";
import { API_URL} from "@/app/constants";

interface WordCloudProps {
    startDate: Date | null;
    endDate: Date | null;
}

interface WordCloudData {
    data: {
      z: {
        dtype: string;
        bdata: string;
        shape: string;
      };
      type: string;
    }[];
    layout: {
      template: {
        data: {
          [key: string]: {
            type: string;
            colorbar: {
              outlinewidth: number;
              ticks: string;
            };
            colorscale: [number, string][];
          }[];
        };
        layout: {
          autotypenumbers: string;
          colorway: string[];
          font: {
            color: string;
          };
          hovermode: string;
          hoverlabel: {
            align: string;
          };
          paper_bgcolor: string;
          plot_bgcolor: string;
          polar: {
            bgcolor: string;
            angularaxis: {
              gridcolor: string;
              linecolor: string;
              ticks: string;
            };
            radialaxis: {
              gridcolor: string;
              linecolor: string;
              ticks: string;
            };
          };
          ternary: {
            bgcolor: string;
            aaxis: {
              gridcolor: string;
              linecolor: string;
              ticks: string;
            };
            baxis: {
              gridcolor: string;
              linecolor: string;
              ticks: string;
            };
            caxis: {
              gridcolor: string;
              linecolor: string;
              ticks: string;
            };
          };
          coloraxis: {
            colorbar: {
              outlinewidth: number;
              ticks: string;
            };
          };
          colorscale: {
            sequential: [number, string][];
            sequentialminus: [number, string][];
            diverging: [number, string][];
          };
          xaxis: {
            gridcolor: string;
            linecolor: string;
            ticks: string;
            title: {
              standoff: number;
            };
            zerolinecolor: string;
            automargin: boolean;
            zerolinewidth: number;
          };
          yaxis: {
            gridcolor: string;
            linecolor: string;
            ticks: string;
            title: {
              standoff: number;
            };
            zerolinecolor: string;
            automargin: boolean;
            zerolinewidth: number;
          };
          scene: {
            xaxis: {
              backgroundcolor: string;
              gridcolor: string;
              linecolor: string;
              showbackground: boolean;
              ticks: string;
              zerolinecolor: string;
              gridwidth: number;
            };
            yaxis: {
              backgroundcolor: string;
              gridcolor: string;
              linecolor: string;
              showbackground: boolean;
              ticks: string;
              zerolinecolor: string;
              gridwidth: number;
            };
            zaxis: {
              backgroundcolor: string;
              gridcolor: string;
              linecolor: string;
              showbackground: boolean;
              ticks: string;
              zerolinecolor: string;
              gridwidth: number;
            };
          };
          shapedefaults: {
            line: {
              color: string;
            };
          };
          annotationdefaults: {
            arrowcolor: string;
            arrowhead: number;
            arrowwidth: number;
          };
          geo: {
            bgcolor: string;
            landcolor: string;
            subunitcolor: string;
            showland: boolean;
            showlakes: boolean;
            lakecolor: string;
          };
          title: {
            x: number;
          };
          mapbox: {
            style: string;
          };
        };
        xaxis: {
          showgrid: boolean;
          zeroline: boolean;
          visible: boolean;
        };
        yaxis: {
          showgrid: boolean;
          zeroline: boolean;
          visible: boolean;
        };
        paper_bgcolor: string;
        plot_bgcolor: string;
      };
    };
}
  

const WordCloud: React.FC<WordCloudProps> = ({ startDate, endDate }) => {
    const [data, setData] = useState<WordCloudData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { fetchWithAuth} = useAuthApi();

    useEffect(() => {
        const fetchWordCloud = async () => {
            if (startDate && endDate) {
                try {
                  const response = await fetchWithAuth(
                    `${API_URL}/v1/claims/wordcloud/generate`,
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
                    setError(err instanceof Error ? err.message : 'Failed to fetch word cloud');
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
            <h2 className={styles.title}>Claim Word cloud</h2>
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

export default WordCloud;
