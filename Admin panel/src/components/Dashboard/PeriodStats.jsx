import React from 'react';
import StatCard from './StatCard';

const PeriodStats = ({ data, period, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const periodLabels = {
    umumiy: 'Umumiy',
    bugungi: 'Bugungi',
    kechagi: 'Kechagi',
    haftalik: 'Haftalik',
    oylik: 'Oylik',
  };

  const stats = [
    {
      title: 'Jami Tranzaksiyalar',
      value: data.jamiTranzaksiyalar || 0,
      formatted: (data.jamiTranzaksiyalar || 0).toLocaleString('uz-UZ'),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Jami Summa',
      value: data.jamiSumma || 0,
      formatted: data.jamiSummaFormatted || '0.00 UZS',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500',
      textColor: 'text-green-700',
    },
    {
      title: 'Qolgan Summa',
      value: data.qolganSumma || 0,
      formatted: data.qolganSummaFormatted || '0.00 UZS',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-red-500 to-rose-500',
      textColor: 'text-red-700',
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">{periodLabels[period] || period}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            formatted={stat.formatted}
            icon={stat.icon}
            gradient={stat.gradient}
            textColor={stat.textColor}
          />
        ))}
      </div>
    </div>
  );
};

export default PeriodStats;
