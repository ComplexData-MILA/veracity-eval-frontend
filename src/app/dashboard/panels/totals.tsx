"use client"

import styles from "../page.module.scss"
import 'tabulator-tables/dist/css/tabulator.min.css';
import React, { useEffect, useState, useRef } from 'react';
import { useAuthApi } from "@/app/hooks/useAuthApi";

import { API_URL} from "@/app/constants";
import { RowComponent } from 'tabulator-tables';
import {useTranslations} from 'next-intl';


// eslint-disable-next-line @typescript-eslint/no-require-imports
const Tabulator = require('tabulator-tables'); 


interface DashboardProps {
    startDate: Date | null;
    endDate: Date | null;
    language: string | null;
}

interface SortedAggregate {
    percent_retrieved: number;
    domain_name: string;
    credibility_score: number | null;
}

interface SourceTable {
    sorted_aggregates: SortedAggregate[];
    total_sources: number;
}

const TotalsTile: React.FC<DashboardProps> = ({ startDate, endDate, language }) => {
    const [tableData, setTableData] = useState<SourceTable | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const {fetchWithAuth} = useAuthApi();
    const tableRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('dashboard');

    useEffect(() => {

        const fetchData = async () => {
            if (startDate && endDate) {
                try {
                const params = new URLSearchParams({
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    language: language || "english",
                }).toString();

                const response = await fetchWithAuth(
                `${API_URL}/v1/sources/total/table?${params}`,
                    {
                        method: 'GET',
                        headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        }
                    }
                );
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${await response.text()}`);
                }

                const data = await response.json();
                setTableData(data)
                
                 setLoading(false);
                
            } catch (err) {
                console.error('Error fetching source table data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch source data');
            } finally {
                setLoading(false);
            }
                
        } else {
            setError("Please select both start and end dates");
            setLoading(false);
        }
      }
      fetchData();
    }, [startDate, endDate, language, fetchWithAuth]);

    useEffect(() => {
        if (tableData && tableRef.current) {
          new Tabulator(tableRef.current, {
            data: tableData.sorted_aggregates.map(item => ({
                ...item,
                percent_retrieved: parseFloat((item.percent_retrieved * 100).toFixed(2)),
                credibility_score: item.credibility_score !== null 
                    ? parseFloat((item.credibility_score * 100).toFixed(2))
                    : null,
            })),
            layout: "fitColumns",
            pagination: "local", 
            paginationSize: 10,
            paginationSizeSelector: [5, 10],
            columns: [
                { title: "Rank", formatter: "rownum", headerSort: false, width: 70 },
                { 
                    title: "% Retrieved Sources", 
                    field: "percent_retrieved", 
                    formatter: "link", 
                    formatterParams: {
                        target: "_blank"
                    }
                },
                { 
                    title: "Domain Name of Source", 
                    field: "domain_name", 
                    formatter: "link", 
                    formatterParams: {
                        target: "_blank"
                    }
                },
                { 
                    title: "Domain Credibility Score in Database", 
                    field: "credibility_score", 
                    formatter: "link", 
                    formatterParams: {
                        target: "_blank"
                    }
                }
            ],
            rowFormatter: (row: RowComponent) => {
                // Use getIndex and getRows to calculate position
                const table = row.getTable();
                const rows = table.getRows();
                const position = rows.findIndex(r => r.getIndex() === row.getIndex());
            
                row.getElement().style.backgroundColor = position % 2 === 0 ? "#f0f8ff" : "#e6f2ff";
            }
          });
        }
      }, [tableData]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
         <div className={styles.totalTile}>
            <div className={styles.bottomTile}>
                <div className={styles.topRowBottomTile}>
                    <div className={styles.lhs}>
                        <h2 className={styles.title}>{t('sourceTable')}</h2>
                        <p className={styles.subtitle}>{t('sourceSub')}</p>
                    </div>
                    <div className={styles.rhs}>
                        <h2 className={styles.subtitle}>{t('totalSources')}</h2>
                        <h3 className={styles.giantNumber}>{tableData?.total_sources}</h3>
                    </div>
                </div>
                <div className={styles.note}>
                    <div id="source-table" ref={tableRef}></div>
                </div>
            </div>
        </div>

);
}

export default TotalsTile;