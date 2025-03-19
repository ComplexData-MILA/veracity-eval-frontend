"use client"

import React, { useEffect, useState } from "react";
import styles from "../page.module.scss"
import { useAuthApi } from "@/app/hooks/useAuthApi";

import { API_URL} from "@/app/constants";

interface DashboardProps {
    startDate: Date | null;
    endDate: Date | null;
    language: string | null;
}


const AggregateTile: React.FC<DashboardProps> = ({ startDate, endDate, language }) => {
  const [totalClaims, setTotalClaims] = useState<number | 0>(0);
  const [avgScore, setAvgScore] = useState<number | 0>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {fetchWithAuth} = useAuthApi();

  useEffect(() => {
      const fetchNumbers = async () => {
          if (startDate && endDate) {
              try {

                const params = new URLSearchParams({
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    language: language || "english",
                }).toString();
                const response_total_claims = await fetchWithAuth(
                  `${API_URL}/v1/claims/length/total?${params}`,
                  {
                    method: 'GET',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    }
                    
                  }
                );

                const response_avg_score = await fetchWithAuth(
                    `${API_URL}/v1/analysis/avg/total?${params}`,
                    {
                      method: 'GET',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                      }
                    }
                  );
                
                if (!response_total_claims.ok) {
                    throw new Error(`Failed to fetch data: ${await response_total_claims.text()}`);
                }
                
                if (!response_avg_score.ok) {
                    throw new Error(`Failed to fetch data: ${await response_avg_score.text()}`);
                }
      
                const total = await response_total_claims.json();
                setTotalClaims(total.total_claims); 

                const avg = await response_avg_score.json();
                setAvgScore(avg.avg_score); 
              } catch (err) {
                  console.error('Error fetching aggregate data:', err);
                  setError(err instanceof Error ? err.message : 'Failed to fetch aggregate');
              } finally {
                  setLoading(false);
              }
            } else {
              setError("Please select both start and end dates");
              setLoading(false);
            }
          };
      
        fetchNumbers();
    }, [startDate, endDate, language, fetchWithAuth]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.topTilesRow}>
        <div className={styles.topTile}>
            <h2 className={styles.title}>Total number of claims</h2>
            <h3 className={styles.giantNumberAvg}>{totalClaims}</h3>
        </div>
        <div className={styles.topTile}>
            <h2 className={styles.title}>Avg reliability score</h2>
            <h3 className={styles.giantNumberAvg}>{(avgScore * 100).toFixed(2)}%</h3>
        </div>
    </div>

  );
};

export default AggregateTile;