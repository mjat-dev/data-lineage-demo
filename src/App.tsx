import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { AppProvider } from '@/context/AppContext';
import Frontier from '@/app/frontier/Frontier';
import Dashboard from '@/app/dashboard/Dashboard';
import DataLineage from '@/app/lineage/DataLineage';
import Marketplace from '@/app/marketplace/Marketplace';
import TaskPage from '@/app/task/TaskPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5F5F5]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Frontier />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="/lineage" element={<DataLineage />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/task" element={<TaskPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
