// import styles from "../page.module.scss"


// export default function WordCloud() {
    
//     return (
//          <div className={styles.mockTile}>
//             <h2 className={styles.title}>Claim Word cloud</h2>
//             <div className={styles.chartWrapper}>
//                 <h1>word</h1>
//                 <h2>cloud</h2>
//                 <p>goes</p>
//                 <h3>here</h3>
//             </div>
//         </div>
// );
// }
"use client"; 

import React, { useEffect, useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import styles from "../page.module.scss"
// @ts-ignore
import Plot from "react-plotly.js";
import { API_URL} from "@/app/constants";

interface WordCloudProps {
    startDate: Date | null;
    endDate: Date | null;
}

const WordCloud: React.FC<WordCloudProps> = ({ startDate, endDate }) => {
    const [data, setData] = useState<any>(null);
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
                  setError("Failed to load word cloud");
                } finally {
                  setLoading(false);
                }
              } else {
                setError("Please select both start and end dates");
                setLoading(false);
              }
            };
        
            fetchWordCloud();
    }, [startDate, endDate]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.mockTile}>
            <h2 className={styles.title}>Claim Word cloud</h2>
                <Plot
                className={styles.plot} 
                data={data.data} 
                layout={data.layout} />     
        </div>

    );
};

export default WordCloud;
