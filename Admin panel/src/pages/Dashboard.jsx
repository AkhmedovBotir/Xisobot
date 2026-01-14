import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import PeriodStats from '../components/Dashboard/PeriodStats';
import KeyMetrics from '../components/Dashboard/KeyMetrics';
import RecentTransactions from '../components/Dashboard/RecentTransactions';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Dashboard ma\'lumotlarini yuklashda xatolik');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Dashboard ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">Xatolik</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <p className="text-sm font-medium text-gray-500">Ma'lumotlar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">Umumiy statistika va muhim ko'rsatkichlar</p>
      </div>

      {/* Muhim Ko'rsatkichlar */}
      <KeyMetrics data={dashboardData.muhimKoRsatkichlar} loading={loading} />

      {/* Umumiy Statistika */}
      <PeriodStats data={dashboardData.umumiy} period="umumiy" loading={loading} />

      {/* Bugungi */}
      <PeriodStats data={dashboardData.bugungi} period="bugungi" loading={loading} />

      {/* Kechagi */}
      <PeriodStats data={dashboardData.kechagi} period="kechagi" loading={loading} />

      {/* Haftalik */}
      <PeriodStats data={dashboardData.haftalik} period="haftalik" loading={loading} />

      {/* Oylik */}
      <PeriodStats data={dashboardData.oylik} period="oylik" loading={loading} />

      {/* So'nggi Tranzaksiyalar */}
      <RecentTransactions transactions={dashboardData.soNggiTranzaksiyalar} loading={loading} />
    </div>
  );
};

export default Dashboard;
