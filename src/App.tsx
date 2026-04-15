import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CodattaConnectContextProvider } from 'codatta-connect';
import { bsc } from 'viem/chains';
import Navbar from '@/components/layout/Navbar';
import { AppProvider } from '@/context/AppContext';
import Frontier from '@/app/frontier/Frontier';
import Dashboard from '@/app/dashboard/Dashboard';
import DataLineage from '@/app/lineage/DataLineage';
import Marketplace from '@/app/marketplace/Marketplace';
import TaskPage from '@/app/task/TaskPage';
import ChainTestPage from '@/app/chain-test/ChainTestPage';
import 'codatta-connect/dist/codatta-connect.css';
import './styles/codatta-connect-overrides.css';

export default function App() {
  return (
    <CodattaConnectContextProvider chains={[bsc]} apiBaseUrl="/api">
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
              <Route path="/chain-test" element={<ChainTestPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AppProvider>
    </CodattaConnectContextProvider>
  );
}
