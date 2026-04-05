import { useState, useEffect } from "react";
import Papa from "papaparse";

export interface RubberData {
  Tarikh: string;
  SMR_CV: number | null;
  SMR_L: number | null;
  SMR_5: number | null;
  SMR_GP: number | null;
  SMR_10: number | null;
  SMR_20: number | null;
  Bulk_Latex: number | null;
}

export function useRubberData() {
  const [data, setData] = useState<RubberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const baseUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSiGOMAMN6gAz9O9HXw-GkDq5gFSYZhTpwoWqURQUumtysZFpoILLJRcCVbaWLyJ0Hs_DUWdcqBiYuK/pub";
        
        // GIDs for the tabs (2022 to 2026)
        const gids = ["0", "55340023", "261804808", "280353949", "488046462"];
        
        // Fetch all tabs in parallel
        const fetchPromises = gids.map(gid => 
          fetch(`${baseUrl}?gid=${gid}&single=true&output=csv`).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch data for tab ${gid}`);
            return res.text();
          })
        );

        const csvTexts = await Promise.all(fetchPromises);
        let allParsedData: RubberData[] = [];

        // Parse each CSV and combine
        csvTexts.forEach(csvText => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const parsedData: RubberData[] = results.data
                .map((row: any) => {
                  if (!row.Tarikh || row.Tarikh.trim() === "") return null;

                  const parseNum = (val: string) => {
                    if (!val || val.trim() === "" || val === "-") return null;
                    const num = parseFloat(val.replace(/,/g, ""));
                    return isNaN(num) ? null : num;
                  };

                  return {
                    Tarikh: row.Tarikh.trim(),
                    SMR_CV: parseNum(row.SMR_CV),
                    SMR_L: parseNum(row.SMR_L),
                    SMR_5: parseNum(row.SMR_5),
                    SMR_GP: parseNum(row.SMR_GP),
                    SMR_10: parseNum(row.SMR_10),
                    SMR_20: parseNum(row.SMR_20),
                    Bulk_Latex: parseNum(row.Bulk_Latex),
                  };
                })
                .filter(Boolean) as RubberData[];

              allParsedData = [...allParsedData, ...parsedData];
            }
          });
        });

        // We now have all the data. Let's make sure it's sorted chronologically 
        // to ensure the charts draw correctly from left to right.
        allParsedData.sort((a, b) => {
          const parseDateString = (dateStr: string) => {
            const parts = dateStr.split(/[-/]/);
            if (parts.length >= 3) {
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1;
              let year = parseInt(parts[2], 10);
              if (year < 100) year += 2000;
              return new Date(year, month, day).getTime();
            }
            return new Date(dateStr).getTime();
          };

          const dateA = parseDateString(a.Tarikh);
          const dateB = parseDateString(b.Tarikh);
          
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateA - dateB;
          }
          return 0; // Fallback
        });

        setData(allParsedData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
