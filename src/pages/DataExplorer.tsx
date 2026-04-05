import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";

export default function DataExplorer() {
  const { filteredData, SMR_GRADES, loading } = useOutletContext<any>();

  return (
    <div className="flex flex-col gap-6 h-full">
      <Card className="shadow-sm border-border flex flex-col flex-1 h-[800px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Historical Data Query</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Historical average records detailed across all grades for the active filter set.</p>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto rounded-md border border-border">
            {loading ? (
              <div className="h-full flex items-center justify-center p-8 text-muted-foreground">Loading dataset...</div>
            ) : (
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs uppercase bg-secondary/80 text-foreground sticky top-0 z-10 shadow-sm border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    {SMR_GRADES.map((g: any) => (
                      <th key={g.key} className="px-6 py-4 font-semibold whitespace-nowrap">{g.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={SMR_GRADES.length + 1} className="text-center py-12">No data directly matches this filter.</td>
                    </tr>
                  ) : (
                    [...filteredData].reverse().map((row: any, i: number) => (
                      <tr key={i} className="border-b border-border/40 hover:bg-accent/30 transition-colors last:border-0">
                        <td className="px-6 py-3.5 font-medium text-foreground whitespace-nowrap">{row.Tarikh}</td>
                        {SMR_GRADES.map((g: any) => (
                          <td key={g.key} className="px-6 py-3.5">
                            {row[g.key] !== null && row[g.key] !== undefined ? row[g.key].toFixed(2) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
