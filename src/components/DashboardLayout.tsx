import { useMemo, useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useRubberData } from "../hooks/useRubberData";
import { Sun, Moon, Filter, LayoutDashboard, LineChart as ChartIcon, Table2, Menu, X } from "lucide-react";

export const SMR_GRADES = [
  { key: "SMR_CV", label: "SMR CV", color: "#8b5cf6" },
  { key: "SMR_L", label: "SMR L", color: "#ec4899" },
  { key: "SMR_5", label: "SMR 5", color: "#f97316" },
  { key: "SMR_GP", label: "SMR GP", color: "#eab308" },
  { key: "SMR_10", label: "SMR 10", color: "#14b8a6" },
  { key: "SMR_20", label: "SMR 20", color: "#3b82f6" },
  { key: "Bulk_Latex", label: "Bulk Latex", color: "#10b981" }
];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function DashboardLayout() {
  const { data, loading, error } = useRubberData();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [startMonth, setStartMonth] = useState<string>("All");
  const [endMonth, setEndMonth] = useState<string>("All");
  const [primaryGrade, setPrimaryGrade] = useState<string>("SMR_20");
  const [activeMetrics, setActiveMetrics] = useState<string[]>(["SMR_20", "Bulk_Latex"]);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const toggleMetric = (metricKey: string) => {
    setActiveMetrics(prev => 
      prev.includes(metricKey) ? prev.filter(m => m !== metricKey) : [...prev, metricKey]
    );
  };

  const { 
    filteredData, availableYears, 
    yearlyAvg, yearlyMax, yearlyMaxDate, yearlyMin, yearlyMinDate,
    periodAvg, periodMax, periodMaxDate, periodMin, periodMinDate 
  } = useMemo(() => {
    if (!data || data.length === 0) return { 
      filteredData: [], availableYears: [], 
      yearlyAvg: 0, yearlyMax: 0, yearlyMaxDate: "-", yearlyMin: 0, yearlyMinDate: "-",
      periodAvg: 0, periodMax: 0, periodMaxDate: "-", periodMin: 0, periodMinDate: "-"
    };
    
    const yearsSet = new Set<string>();
    const enhancedData = data.map(item => {
      let year = "Unknown";
      let month = "Unknown";
      
      const parts = item.Tarikh.split(/[-/ ]/);
      if (parts.length >= 3) {
         year = parts[2]; 
         if (year.length === 2) year = "20" + year;
         
         // Assuming format is DD/MM/YYYY
         const monthNum = parseInt(parts[1], 10) - 1;
         if (monthNum >= 0 && monthNum < 12) {
           month = MONTHS[monthNum];
         }
      } else {
        // Fallback if the date matches something entirely different
        const dateObj = new Date(item.Tarikh);
        if (!isNaN(dateObj.getTime())) {
          year = dateObj.getFullYear().toString();
          month = MONTHS[dateObj.getMonth()];
        }
      }
      if (year !== "Unknown") yearsSet.add(year);
      return { ...item, parsedYear: year, parsedMonth: month, Premium_Spread: (item.SMR_CV && item.SMR_20) ? Number((item.SMR_CV - item.SMR_20).toFixed(2)) : null };
    });

    const years = Array.from(yearsSet).sort().reverse();
    const startIdx = startMonth === "All" ? 0 : MONTHS.indexOf(startMonth);
    const endIdx = endMonth === "All" ? 11 : MONTHS.indexOf(endMonth);

    const filtered = enhancedData.filter(item => {
      const matchYear = selectedYear === "All" || item.parsedYear === selectedYear;
      const itemMonthIdx = MONTHS.indexOf(item.parsedMonth);
      const matchMonth = itemMonthIdx >= startIdx && itemMonthIdx <= endIdx;
      return matchYear && matchMonth;
    });

    const yearlyData = enhancedData.filter(item => selectedYear === "All" || item.parsedYear === selectedYear);
    
    let yMax = 0, yMin = Infinity, ySum = 0, yCount = 0;
    let yMaxDate = "-", yMinDate = "-";
    yearlyData.forEach(d => {
      const val = (d as any)[primaryGrade];
      if (val !== null && val !== undefined) {
        if (val > yMax) { yMax = val; yMaxDate = d.Tarikh; }
        if (val < yMin) { yMin = val; yMinDate = d.Tarikh; }
        ySum += val;
        yCount++;
      }
    });
    if (yMin === Infinity) yMin = 0;

    let pMax = 0, pMin = Infinity, pSum = 0, pCount = 0;
    let pMaxDate = "-", pMinDate = "-";
    filtered.forEach(d => {
      const val = (d as any)[primaryGrade];
      if (val !== null && val !== undefined) {
        if (val > pMax) { pMax = val; pMaxDate = d.Tarikh; }
        if (val < pMin) { pMin = val; pMinDate = d.Tarikh; }
        pSum += val;
        pCount++;
      }
    });
    if (pMin === Infinity) pMin = 0;

    return { 
      filteredData: filtered, availableYears: years, 
      yearlyAvg: yCount > 0 ? ySum / yCount : 0, 
      yearlyMax: yMax, yearlyMaxDate: yMaxDate, 
      yearlyMin: yMin, yearlyMinDate: yMinDate,
      periodAvg: pCount > 0 ? pSum / pCount : 0, 
      periodMax: pMax, periodMaxDate: pMaxDate,
      periodMin: pMin, periodMinDate: pMinDate
    };
  }, [data, selectedYear, startMonth, endMonth, primaryGrade]);

  const kpis = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;
    const latestItems = [...filteredData].reverse();
    
    const latestPrimaryRow = latestItems.find(d => (d as any)[primaryGrade] !== null) as any;
    const previousPrimaryRow = latestItems.find(d => (d as any)[primaryGrade] !== null && d.Tarikh !== latestPrimaryRow?.Tarikh) as any;
    
    const primaryPrice = latestPrimaryRow ? latestPrimaryRow[primaryGrade] : 0;
    const primaryPrev = previousPrimaryRow ? previousPrimaryRow[primaryGrade] : 0;
    const primaryDiff = primaryPrice - primaryPrev;

    let minPrice = Infinity;
    filteredData.forEach(d => {
      const val = (d as any)[primaryGrade];
      if (val !== null && val !== undefined && val < minPrice) minPrice = val;
    });
    const volatility = periodMax > 0 && minPrice !== Infinity ? (periodMax - minPrice) : 0;

    const gradeComparison = SMR_GRADES.map(grade => {
      const row = latestItems.find(d => (d as any)[grade.key] !== null) as any;
      let gMin = Infinity, gMax = 0, gSum = 0, gCount = 0;
      filteredData.forEach(d => {
        const val = (d as any)[grade.key];
        if (val !== null && val !== undefined) {
           if (val < gMin) gMin = val;
           if (val > gMax) gMax = val;
           gSum += val;
           gCount++;
        }
      });
      if (gMin === Infinity) gMin = 0;

      return { 
        name: grade.label, 
        price: row ? row[grade.key] : 0, 
        latestDate: row ? row.Tarikh : "-",
        min: gMin, 
        max: gMax, 
        avg: gCount > 0 ? gSum / gCount : 0,
        color: grade.color 
      };
    }).filter(g => g.price > 0);

    return {
      primary: { price: primaryPrice, diff: primaryDiff },
      ipgActivated: primaryGrade === 'SMR_20' ? (primaryPrice > 0 && primaryPrice < 300) : (latestItems.find(d => d.SMR_20 !== null)?.SMR_20 || 0) > 0 && (latestItems.find(d => d.SMR_20 !== null)?.SMR_20 || 0) < 300,
      volatility, gradeComparison, totalRecords: filteredData.length
    };
  }, [filteredData, periodMax, primaryGrade]);

  const renderTrend = (diff: number) => {
    if (diff > 0) return <span className="flex items-center text-green-600 text-sm font-medium"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg> {diff.toFixed(2)}</span>;
    if (diff < 0) return <span className="flex items-center text-red-500 text-sm font-medium"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg> {Math.abs(diff).toFixed(2)}</span>;
    return <span className="flex items-center text-muted-foreground text-sm font-medium"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="5" y1="12" x2="19" y2="12"></line></svg> 0.00</span>;
  };

  const navLinks = [
    { to: "/", icon: <LayoutDashboard className="w-5 h-5" />, label: "Overview" },
    { to: "/analytics", icon: <ChartIcon className="w-5 h-5" />, label: "Advanced Analytics" },
    { to: "/explorer", icon: <Table2 className="w-5 h-5" />, label: "Data Explorer" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-card border border-border rounded-md shadow-md">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 w-64 h-full bg-card border-r border-border flex flex-col transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
             <h2 className="text-xl font-bold text-primary tracking-tight">LGM</h2>
             <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">Market Portal</p>
          </div>
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-accent transition-colors" aria-label="Toggle Dark Mode">
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Dashboards</p>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
            >
              {link.icon} {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground/60 text-center">
            &copy; {new Date().getFullYear()} arifazmie.<br />All rights reserved.
          </p>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Global Filters Header */}
        <header className="p-4 md:p-6 pb-2 border-b border-border/50 bg-background/95 backdrop-blur z-30 sticky top-0">
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground">Rubber Market Price Performance Analysis</p>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="flex bg-card/60 rounded-xl border border-border p-3 gap-4 items-center shadow-sm w-max min-w-full">
              <div className="flex items-center gap-2 text-muted-foreground font-medium pr-4 border-r border-border/50">
                <Filter className="w-4 h-4 text-primary" /> 
                <span className="text-xs tracking-wide uppercase">Filters</span>
              </div>
              
              <div className="relative w-36">
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="w-full appearance-none bg-card border border-input text-foreground text-sm rounded-md px-3 py-2 shadow-sm focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer">
                  <option value="All">All Years</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="relative w-36">
                <select value={startMonth} onChange={e => setStartMonth(e.target.value)} className="w-full appearance-none bg-card border border-input text-foreground text-sm rounded-md px-3 py-2 shadow-sm focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer">
                  <option value="All">Start Month</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              
              <div className="relative w-36">
                <select value={endMonth} onChange={e => setEndMonth(e.target.value)} className="w-full appearance-none bg-card border border-input text-foreground text-sm rounded-md px-3 py-2 shadow-sm focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer">
                  <option value="All">End Month</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="relative w-44 ml-auto border-l border-border/50 pl-4">
                <select value={primaryGrade} onChange={e => setPrimaryGrade(e.target.value)} className="w-full appearance-none bg-primary/5 border border-primary/20 text-primary font-medium text-sm rounded-md px-3 py-2 shadow-sm focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer">
                  {SMR_GRADES.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Outlet Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-accent/20">
          <Outlet context={{
            data, loading, error, filteredData, availableYears, 
            kpis, yearlyAvg, yearlyMax, yearlyMaxDate, yearlyMin, yearlyMinDate,
            periodAvg, periodMax, periodMaxDate, periodMin, periodMinDate,
            activeMetrics, toggleMetric, primaryGrade, 
            SMR_GRADES, MONTHS, renderTrend
          }} />
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
}
