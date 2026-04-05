import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine, Legend
} from "recharts";
import { CalendarDays, Maximize2 } from "lucide-react";

export default function Analytics() {
  const { 
    filteredData, loading, kpis, 
    periodAvg, periodMax, periodMaxDate, periodMin, periodMinDate,
    yearlyAvg, yearlyMax, yearlyMaxDate, yearlyMin, yearlyMinDate, 
    primaryGrade, SMR_GRADES 
  } = useOutletContext<any>();

  const gradeLabel = SMR_GRADES.find((g: any) => g.key === primaryGrade)?.label;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Aggregated Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
               <CalendarDays className="w-4 h-4 text-primary" /> Filtered Period Stats ({gradeLabel})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Analytics for the specific time range you have filtered.</p>
          </CardHeader>
          <CardContent className="mt-2">
            {loading ? <Skeleton className="h-32 w-full" /> : (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Average Price</p>
                  <p className="text-3xl font-bold">{periodAvg.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">Sen/Kg</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Period High</p>
                    <p className="text-lg font-bold text-primary">{periodMax.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{periodMaxDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Period Low</p>
                    <p className="text-lg font-bold">{periodMin.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{periodMinDate}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
               <Maximize2 className="w-4 h-4 text-primary" /> Selected Year Stats ({gradeLabel})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Analytics spanning the entire selected year(s).</p>
          </CardHeader>
          <CardContent className="mt-2">
            {loading ? <Skeleton className="h-32 w-full" /> : (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Yearly Average</p>
                  <p className="text-3xl font-bold">{yearlyAvg.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">Sen/Kg</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Year High</p>
                    <p className="text-lg font-bold text-primary">{yearlyMax.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{yearlyMaxDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Year Low</p>
                    <p className="text-lg font-bold">{yearlyMin.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{yearlyMinDate}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Grade Comparison List */}
        <Card className="shadow-sm border-border flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Current Prices by Grade</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Latest prices relative to their own min and max thresholds within the active period</p>
          </CardHeader>
          <CardContent>
            {loading || !kpis ? (
              <Skeleton className="h-48 w-full rounded-md" />
            ) : (
              <div className="space-y-4">
                {kpis.gradeComparison.map((grade: any) => {
                  const range = grade.max - grade.min;
                  const percentage = range > 0 ? ((grade.price - grade.min) / range) * 100 : 50;
                  
                  return (
                    <div key={grade.name} className="flex flex-col gap-1.5 relative mb-2">
                       <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{grade.name}</span>
                          <span className="text-[10px] bg-accent text-muted-foreground px-1.5 py-0.5 rounded-sm" title="Latest Date">{grade.latestDate}</span>
                        </div>
                        <span className="font-bold text-foreground">{grade.price.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">Sen</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground font-mono w-10 text-right" title="Period Minimum">{grade.min.toFixed(2)}</span>
                        <div className="flex-1 bg-secondary h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${Math.max(percentage, 2)}%`, backgroundColor: grade.color }} 
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono w-10" title="Period Maximum">{grade.max.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Extremes Comparison */}
        <Card className="shadow-sm border-border flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Price Extremes Comparison</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">A simple comparison of the Lowest, Average, and Highest prices recorded.</p>
          </CardHeader>
          <CardContent className="pt-4 pb-6 flex-1 min-h-[350px]">
            {loading || !kpis ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={kpis.gradeComparison} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: "var(--color-muted-foreground)"}} interval={0} />
                    <YAxis tick={{fontSize: 10, fill: "var(--color-muted-foreground)"}} width={50} />
                    <Tooltip 
                      cursor={{fill: 'var(--color-secondary)', opacity: 0.4}} 
                      contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-foreground)", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(value: any, name: any) => {
                        return [`${Number(value).toFixed(2)} Sen/Kg`, name];
                      }}
                    />
                    <Legend wrapperStyle={{fontSize: 12, paddingTop: '10px'}} />
                    <Bar dataKey="min" name="Lowest Price" fill="var(--color-muted-foreground)" opacity={0.5} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg" name="Average Price" fill="var(--color-primary)" opacity={0.8} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max" name="Highest Price" fill="var(--color-foreground)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Premium Spread Area Chart */}
        <Card className="shadow-sm border-border flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Premium Spread Focus</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">SMR CV vs SMR 20 absolute difference across timeframe</p>
          </CardHeader>
          <CardContent className="pt-4 pb-6 flex-1 min-h-[320px]">
            {loading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : filteredData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">No data</div>
            ) : (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpread" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                    <XAxis dataKey="Tarikh" tick={false} axisLine={false} />
                    <YAxis tick={{fontSize: 11, fill: "var(--color-muted-foreground)"}} width={30} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-foreground)", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Area type="monotone" dataKey="Premium_Spread" name="Spread (Sen/Kg)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSpread)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benchmark Divergence Chart */}
        <Card className="shadow-sm border-border flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SMR 20 Benchmark Spread</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Average hierarchical Premium (+) or Discount (-) relative to SMR 20</p>
          </CardHeader>
          <CardContent className="pt-2 pb-6 flex-1 min-h-[320px]">
             {loading || !kpis ? (
               <Skeleton className="h-full w-full rounded-md" />
             ) : (() => {
               const smr20Avg = kpis.gradeComparison.find((g: any) => g.name === 'SMR 20')?.avg || 0;
               const benchmarkData = kpis.gradeComparison.map((g: any) => ({
                 name: g.name,
                 spread: Number((g.avg - smr20Avg).toFixed(2)),
               })).sort((a: any, b: any) => b.spread - a.spread);

               return (
                 <div className="h-full w-full relative flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={benchmarkData} margin={{ top: 30, right: 30, left: -10, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                       <XAxis dataKey="name" tick={{fontSize: 10, fill: "var(--color-muted-foreground)"}} interval={0} />
                       <YAxis tick={{fontSize: 10, fill: "var(--color-muted-foreground)"}} width={50} />
                       <Tooltip 
                         cursor={{fill: 'var(--color-secondary)', opacity: 0.4}}
                         contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-foreground)", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                         formatter={(value: any) => [
                           `${Number(value) > 0 ? '+' : ''}${value} Sen/Kg`, 
                           Number(value) > 0 ? "Premium" : Number(value) < 0 ? "Discount" : "Benchmark"
                         ]}
                       />
                       <ReferenceLine y={0} stroke="var(--color-border)" strokeWidth={2} />
                       <Bar dataKey="spread" radius={[4, 4, 4, 4]} barSize={40}>
                         {benchmarkData.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.spread > 0 ? 'var(--color-primary)' : entry.spread < 0 ? '#ef4444' : 'var(--color-muted-foreground)'} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               );
             })()}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
