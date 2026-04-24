import DashboardCards from './DashboardCards';
import InterestCard from './interest-card';
// import WalletCard from '../../../components/Dashboard/WalletCard';
// import { useNavigate } from 'react-router-dom';
import { useGetDashboardCounts, useGetRecentData } from '../../../queries/admin';
import { Box } from '@mui/material';

const AdminDashboard = () => {
  const { data: dashboardData } = useGetDashboardCounts();
  const { data: recentData } = useGetRecentData();

  // Fallback to empty objects if data is missing or error occurs
  const displayCounts = (dashboardData?.success && dashboardData?.data) ? dashboardData.data : {
    totalMembers: 0,
    totalAccounts: 0,
    totalAgents: 0,
    closingBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
    accountsByType: []
  };

  const displayRecentData = (recentData?.success && recentData?.data) ? recentData.data : {
    recentMembers: [],
    recentAccounts: []
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: '100%' }}>
      {/* Top margin to separate from the fixed navbar - using smaller margin since App.tsx already provides padding */}
      <Box sx={{ mt: 2 }} />
      
      <div className="mb-4">
        {/* WalletCard placeholder if needed later */}
      </div>

      <InterestCard />

      <DashboardCards 
        counts={displayCounts as any} 
        recentData={displayRecentData as any} 
      />
    </div>
  );
};

export default AdminDashboard;
