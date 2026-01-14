import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecentTransactions = ({ transactions, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">So'nggi Tranzaksiyalar</h3>
        <div className="text-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Tranzaksiyalar topilmadi</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
        <h3 className="text-lg font-semibold text-gray-900">So'nggi Tranzaksiyalar</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Xaridor
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sotuvchi
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Diller
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Summa
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vaqt
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{transaction.xaridorIsmi}</span>
                    {transaction.xaridorFamiliyasi && (
                      <span className="text-sm text-gray-600 ml-1">{transaction.xaridorFamiliyasi}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{transaction.telefonRaqami}</p>
                </td>
                <td className="px-6 py-4">
                  {transaction.sotuvchi ? (
                    <div className="flex items-center gap-2">
                      {transaction.sotuvchi.tartibRaqami && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                          {transaction.sotuvchi.tartibRaqami}
                        </span>
                      )}
                      <span className="text-sm text-gray-900">
                        {transaction.sotuvchi.fullName || 
                         (transaction.sotuvchi.ism && transaction.sotuvchi.familiya 
                          ? `${transaction.sotuvchi.ism} ${transaction.sotuvchi.familiya}` 
                          : transaction.sotuvchi.ism || '-')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {transaction.diller ? (
                    <div className="flex items-center gap-2">
                      {transaction.diller.tartibRaqami && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                          {transaction.diller.tartibRaqami}
                        </span>
                      )}
                      <span className="text-sm text-gray-900">
                        {transaction.diller.fullName || 
                         (transaction.diller.ism && transaction.diller.familiya 
                          ? `${transaction.diller.ism} ${transaction.diller.familiya}` 
                          : transaction.diller.ism || '-')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">{transaction.summa}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {new Date(transaction.vaqt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => navigate('/statistika')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Statistikaga o'tish"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => navigate('/statistika')}
          className="w-full px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Barcha tranzaksiyalarni ko'rish →
        </button>
      </div>
    </div>
  );
};

export default RecentTransactions;
