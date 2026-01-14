import React, { useState, useEffect } from 'react';
import { statistikaService } from '../services/statistikaService';
import StatistikaTable from '../components/Statistika/StatistikaTable';
import StatistikaDetailModal from '../components/Statistika/StatistikaDetailModal';
import StatistikaFilters from '../components/Statistika/StatistikaFilters';
import StatistikaRaqamlar from '../components/Statistika/StatistikaRaqamlar';

const Statistika = () => {
  const [activeTab, setActiveTab] = useState('raqamlar'); // 'raqamlar' yoki 'jadval'
  const [statistika, setStatistika] = useState([]);
  const [raqamlarData, setRaqamlarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRaqamlar, setLoadingRaqamlar] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (activeTab === 'jadval') {
      fetchStatistika();
    } else {
      fetchRaqamlar();
    }
  }, [appliedFilters, pagination.page, pagination.limit, activeTab]);

  const fetchStatistika = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        ...appliedFilters,
        page: pagination.page,
        limit: pagination.limit,
      };
      
      // Bo'sh stringlarni olib tashlash
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await statistikaService.getStatistika(params);
      if (response.success) {
        setStatistika(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
          count: response.count || 0,
        }));
      } else {
        setError(response.message || 'Statistikani yuklashda xatolik');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Statistikani yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchRaqamlar = async () => {
    try {
      setLoadingRaqamlar(true);
      setError('');
      const params = { ...appliedFilters };
      
      // Bo'sh stringlarni olib tashlash
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await statistikaService.getStatistikaRaqamlar(params);
      if (response.success) {
        setRaqamlarData(response.data);
      } else {
        setError(response.message || 'Raqamli statistikani yuklashda xatolik');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Raqamli statistikani yuklashda xatolik');
    } finally {
      setLoadingRaqamlar(false);
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDateChange = (field, value) => {
    // Bu faqat tempFilters uchun, amalga oshirilmaydi
  };

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters || {});
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Filtrlash bosilganda, agar raqamlar tabida bo'lsa, raqamlar ma'lumotlarini yangilash
    if (activeTab === 'raqamlar') {
      fetchRaqamlar();
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setAppliedFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header with Tab Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Statistika
          </h1>
          <p className="mt-2 text-sm text-gray-600">To'lov tranzaksiyalari statistikasi</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('raqamlar')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'raqamlar'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Raqamli
              </div>
            </button>
            <button
              onClick={() => setActiveTab('jadval')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'jadval'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Jadval
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <StatistikaFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onDateChange={handleDateChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Error Message */}
      {error && (
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
      )}

      {/* Tab Content */}
      {activeTab === 'raqamlar' ? (
        <StatistikaRaqamlar data={raqamlarData} loading={loadingRaqamlar} />
      ) : (
        <>
          {/* Table */}
          <StatistikaTable
            statistika={statistika}
            onView={handleView}
            loading={loading}
            appliedFilters={appliedFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600">
                Sahifa <span className="font-semibold text-gray-900">{pagination.page}</span> /{' '}
                <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Oldingi
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Keyingi
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          {!loading && statistika.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-sm text-gray-600">
                Ko'rsatilmoqda: <span className="font-semibold text-gray-900">{statistika.length}</span> /{' '}
                <span className="font-semibold text-gray-900">{pagination.total}</span> tranzaksiya
              </span>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <StatistikaDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </div>
  );
};

export default Statistika;
