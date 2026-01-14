import React from 'react';

const KeyMetrics = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      label: 'Jami Dillerlar',
      value: data.jamiDillerlar || 0,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      label: 'Faol Dillerlar',
      value: data.faolDillerlar || 0,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Jami Sotuvchilar',
      value: data.jamiSotuvchilar || 0,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Faol Sotuvchilar',
      value: data.faolSotuvchilar || 0,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      label: 'Yangi Tranzaksiyalar',
      value: data.yangiTranzaksiyalar || 0,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: 'from-red-500 to-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Muhim Ko'rsatkichlar</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className={`w-14 h-14 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center shadow-md mb-4 flex-shrink-0`}>
                {metric.icon}
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 leading-tight px-1 flex-1">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">
                {metric.value.toLocaleString('uz-UZ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyMetrics;
