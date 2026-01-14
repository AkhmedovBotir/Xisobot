import React from 'react';

const PaymentFilters = ({ filters, onFilterChange, onDateChange }) => {
  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Operatsiya Raqami */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operatsiya Raqami
          </label>
          <input
            type="text"
            value={filters.operatsiyaRaqami || ''}
            onChange={(e) => handleInputChange('operatsiyaRaqami', e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="666247"
          />
        </div>

        {/* Tranzaksiya ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tranzaksiya ID
          </label>
          <input
            type="text"
            value={filters.tranzaksiyaId || ''}
            onChange={(e) => handleInputChange('tranzaksiyaId', e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="116284"
          />
        </div>

        {/* Terminal ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Terminal ID
          </label>
          <input
            type="text"
            value={filters.terminalId || ''}
            onChange={(e) => handleInputChange('terminalId', e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="03620Z51"
          />
        </div>

        {/* Merchant ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Merchant ID
          </label>
          <input
            type="text"
            value={filters.merchantId || ''}
            onChange={(e) => handleInputChange('merchantId', e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="000330567230903"
          />
        </div>

        {/* Mijoz Telefon Raqami */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mijoz Telefon Raqami
          </label>
          <input
            type="text"
            value={filters.mijozTelefonRaqami || ''}
            onChange={(e) => handleInputChange('mijozTelefonRaqami', e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="998942330690"
          />
        </div>

        {/* Mijoz Ismi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mijoz Ismi
          </label>
          <input
            type="text"
            value={filters.mijozIsmi || ''}
            onChange={(e) => handleInputChange('mijozIsmi', e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="FERUZA ADASHEVA"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Boshlang'ich Sana
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onDateChange('startDate', e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tugash Sanasi
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onDateChange('endDate', e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={() => {
              onFilterChange({});
              onDateChange('startDate', '');
              onDateChange('endDate', '');
            }}
            className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Filtrlarni Tozalash
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFilters;
