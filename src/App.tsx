import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/Overview';
import Analytics from './pages/Analytics';
import DataExplorer from './pages/DataExplorer';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="explorer" element={<DataExplorer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
