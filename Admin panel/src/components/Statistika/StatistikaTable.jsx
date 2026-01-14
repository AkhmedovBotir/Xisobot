import React, { useState } from 'react';
import { statistikaService } from '../../services/statistikaService';

const StatistikaTable = ({ statistika, onView, loading, appliedFilters, onClearFilters }) => {
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportStatus(null);

      // Export so'rovini yuborish
      const response = await statistikaService.exportStatistika(appliedFilters || {});
      
      if (response.success) {
        setExportStatus({
          exportId: response.exportId,
          filename: response.filename,
          status: response.status,
        });

        // Agar fayl tayyor bo'lsa, darhol yuklab olish
        if (response.status === 'completed' && response.downloadUrl) {
          await downloadFile(response.filename, response.exportId);
        } else if (response.status === 'processing') {
          // Jarayonni kuzatish
          pollExportStatus(response.exportId, response.filename);
        }
      } else {
        alert(response.message || 'Export qilishda xatolik');
      }
    } catch (error) {
      console.error('Export xatosi:', error);
      alert(error.response?.data?.message || 'Export qilishda xatolik yuz berdi');
    } finally {
      setExporting(false);
    }
  };

  const pollExportStatus = async (exportId, filename) => {
    const maxAttempts = 30; // 30 marta urinish (30 soniya)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const statusResponse = await statistikaService.getExportStatus(exportId);
        
        if (statusResponse.success) {
          if (statusResponse.status === 'completed') {
            await downloadFile(filename, exportId);
            setExportStatus(null);
          } else if (statusResponse.status === 'error') {
            alert(statusResponse.message || 'Export jarayonida xatolik');
            setExportStatus(null);
          } else if (attempts < maxAttempts) {
            // 1 soniyadan keyin qayta tekshirish
            setTimeout(checkStatus, 1000);
            attempts++;
          } else {
            alert('Export jarayoni uzoq davom etmoqda. Iltimos, keyinroq urinib ko\'ring.');
            setExportStatus(null);
          }
        }
      } catch (error) {
        console.error('Status tekshirish xatosi:', error);
        setExportStatus(null);
      }
    };

    checkStatus();
  };

  const downloadFile = async (filename, exportId) => {
    try {
      const response = await statistikaService.downloadExport(filename, exportId);
      
      // Blob dan fayl yaratish va yuklab olish
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fayl yuklab olish xatosi:', error);
      alert(error.response?.data?.message || 'Fayl yuklab olishda xatolik');
    }
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (statistika.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header with Filter and Clear buttons */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Statistika Jadvali</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Export qilinmoqda...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Excel Export</span>
                </>
              )}
            </button>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Tozalash</span>
            </button>
          </div>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Statistika ma'lumotlari topilmadi</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with Filter and Clear buttons */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Statistika Jadvali</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Export qilinmoqda...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Excel Export</span>
              </>
            )}
          </button>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Tozalash</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Xaridor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sotuvchi
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Diller
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Summa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Qolgan
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vaqt
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {statistika.map((item) => (
              <tr key={item._id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{item.xaridorIsmi}</span>
                    {item.xaridorFamiliyasi && (
                      <span className="text-sm text-gray-600 ml-1">{item.xaridorFamiliyasi}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{item.telefonRaqami}</span>
                </td>
                <td className="px-6 py-4">
                  {item.sotuvchi ? (
                    <div className="flex items-center gap-2">
                      {item.sotuvchi.tartibRaqami && (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold text-xs border border-blue-200 flex-shrink-0">
                          {item.sotuvchi.tartibRaqami}
                        </span>
                      )}
                      <span className="text-sm text-gray-900">
                        {item.sotuvchi.fullName || 
                         (item.sotuvchi.ism && item.sotuvchi.familiya 
                          ? `${item.sotuvchi.ism} ${item.sotuvchi.familiya}` 
                          : item.sotuvchi.ism || item.sotuvchi.name || '-')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {item.diller ? (
                    <div className="flex items-center gap-2">
                      {item.diller.tartibRaqami && (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold text-xs border border-purple-200 flex-shrink-0">
                          {item.diller.tartibRaqami}
                        </span>
                      )}
                      <span className="text-sm text-gray-900">
                        {item.diller.fullName || 
                         (item.diller.ism && item.diller.familiya 
                          ? `${item.diller.ism} ${item.diller.familiya}` 
                          : item.diller.ism || item.diller.name || '-')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">{item.summa}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${
                    parseFloat(item.qolganSumma) > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.qolganSummaFormatted}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {new Date(item.vaqt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => onView(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Ko'rish"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatistikaTable;
