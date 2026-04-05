import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { CalendarDays } from "lucide-react";

export default function Overview() {
  const { loading, error, filteredData, kpis, activeMetrics, toggleMetric, primaryGrade, SMR_GRADES, renderTrend, periodMaxDate, periodMinDate, periodMax, periodMin } = useOutletContext<any>();

  if (error) return <div className="p-6 text-red-500">Error loading data: {error}</div>;

  const currentGradeLabel = SMR_GRADES.find((g: any) => g.key === primaryGrade)?.label;
  const latestDate = kpis?.gradeComparison?.find((g: any) => g.name === currentGradeLabel)?.latestDate || "";

  return (
    <div className="flex flex-col gap-6">
      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading || !kpis ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-4 w-20" /></CardContent></Card>
          ))
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Latest {currentGradeLabel} Price</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <div className="text-3xl font-bold flex items-end gap-2">
                    {kpis.primary.price.toFixed(2)} <span className="text-sm font-normal text-muted-foreground mb-1">Sen/Kg</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderTrend(kpis.primary.diff)}
                    <span className="text-xs text-muted-foreground border-l border-border pl-2 border-opacity-50">vs prev</span>
                    <span className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded text-muted-foreground ml-auto">{latestDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Data Records</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <div className="text-3xl font-bold text-foreground">{kpis.totalRecords} <span className="text-sm font-normal text-muted-foreground">Records</span></div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="w-3 h-3" /> Data points in selected period
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground" title="The price gap between the absolute highest and lowest recorded prices for the active period">Volatility Spread ({currentGradeLabel})</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <div className="text-3xl font-bold text-primary">{kpis.volatility.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">Sen/Kg</span></div>
                  <div className="mt-1 flex flex-col text-[10px] text-muted-foreground font-mono bg-secondary/20 p-1.5 rounded border border-border/50">
                     <div className="flex justify-between items-center">
                       <span>High <span className="text-primary font-bold pl-1">{periodMax?.toFixed(2)}</span></span> 
                       <span className="bg-background px-1 rounded shadow-sm">{periodMaxDate}</span>
                     </div>
                     <div className="flex justify-between items-center mt-1">
                       <span>Low <span className="text-destructive font-bold pl-1">{periodMin?.toFixed(2)}</span></span> 
                       <span className="bg-background px-1 rounded shadow-sm">{periodMinDate}</span>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">IPG Subsidy Status</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 pt-1">
                  <div>
                    {kpis.ipgActivated ? <Badge variant="destructive" className="font-bold text-sm px-3 py-1">ACTIVATED</Badge> : <Badge variant="success" className="font-bold text-sm px-3 py-1">SAFE</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Threshold: <span className="font-medium text-foreground">RM3.00 (SMR 20 Only)</span></div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Chart */}
      <Card className="p-2 lg:p-6 shadow-sm border-border flex flex-col min-h-[500px]">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Time-Series Price Trend</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Compare different grades over the selected period.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {SMR_GRADES.map((grade: any) => (
                <button
                  key={grade.key}
                  onClick={() => toggleMetric(grade.key)}
                  style={{ 
                    borderColor: activeMetrics.includes(grade.key) ? grade.color : undefined,
                    backgroundColor: activeMetrics.includes(grade.key) ? grade.color : undefined,
                    color: activeMetrics.includes(grade.key) ? '#fff' : undefined 
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all border shadow-sm ${activeMetrics.includes(grade.key) ? 'font-medium' : 'bg-transparent border-input text-muted-foreground hover:border-foreground hover:bg-accent'}`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 mt-4 pb-0 min-h-[400px]">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center"><Skeleton className="h-[400px] w-full rounded-md" /></div>
          ) : filteredData.length === 0 ? (
            <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">No data for selected period</div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                  <XAxis dataKey="Tarikh" minTickGap={30} tick={{fontSize: 12, fill: "var(--color-muted-foreground)"}} />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: "var(--color-muted-foreground)"}} width={40} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-foreground)", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} itemStyle={{ color: "var(--color-foreground)", padding: "2px 0" }} labelStyle={{ marginBottom: "8px", fontWeight: "bold" }} />
                  <ReferenceLine y={300} stroke="red" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'IPG Threshold', fill: 'red', fontSize: 11 }} />
                  {SMR_GRADES.filter((g: any) => activeMetrics.includes(g.key)).map((grade: any) => (
                    <Line key={grade.key} type="monotone" dataKey={grade.key} name={grade.label} stroke={grade.color} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
