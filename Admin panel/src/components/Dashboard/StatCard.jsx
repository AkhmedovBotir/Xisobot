import React from 'react';

const StatCard = ({ title, value, formatted, icon, gradient, textColor = 'text-gray-900' }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 h-full">
      <div className="flex items-start gap-4 h-full">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 leading-tight">
            {title}
          </p>
          <p className={`text-lg sm:text-xl font-bold ${textColor} break-words leading-tight`}>
            {formatted || value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
