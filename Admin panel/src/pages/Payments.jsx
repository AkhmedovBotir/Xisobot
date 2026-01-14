import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import PaymentTable from '../components/Payments/PaymentTable';
import PaymentDetailModal from '../components/Payments/PaymentDetailModal';
import PaymentFilters from '../components/Payments/PaymentFilters';
import PaymentStats from '../components/Payments/PaymentStats';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filters, pagination.page, pagination.limit]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      const response = await paymentService.getAllPayments(params);
      if (response.success) {
        setPayments(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
          count: response.count || 0,
        }));
      } else {
        setError(response.message || 'Tranzaksiyalarni yuklashda xatolik');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Tranzaksiyalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await paymentService.getPaymentStats(params);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Stats yuklashda xatolik:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDateChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value || undefined,
    };
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            To'lov Tranzaksiyalari
          </h1>
          <p className="mt-2 text-sm text-gray-600">Guruhdagi to'lov tranzaksiyalarini ko'rish va boshqarish</p>
        </div>
      </div>

      {/* Stats */}
      <PaymentStats stats={stats} loading={statsLoading} />

      {/* Filters */}
      <PaymentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onDateChange={handleDateChange}
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

      {/* Table */}
      <PaymentTable
        payments={payments}
        onView={handleView}
        loading={loading}
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
      {!loading && payments.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm text-gray-600">
            Ko'rsatilmoqda: <span className="font-semibold text-gray-900">{payments.length}</span> /{' '}
            <span className="font-semibold text-gray-900">{pagination.total}</span> tranzaksiya
          </span>
        </div>
      )}

      {/* Detail Modal */}
      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />
    </div>
  );
};

export default Payments;
