import React, { useState, useEffect, useMemo } from 'react';
import { dillerService } from '../services/dillerService';
import DillerTable from '../components/Dillers/DillerTable';
import DillerModal from '../components/Dillers/DillerModal';
import DillerDetailModal from '../components/Dillers/DillerDetailModal';
import DillerFilters from '../components/Dillers/DillerFilters';

const Dillers = () => {
  const [dillers, setDillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDiller, setSelectedDiller] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchDillers();
  }, [filters, searchValue]);

  // Tartib raqamiga qarab tartiblash
  const sortedDillers = useMemo(() => {
    return [...dillers].sort((a, b) => {
      return (a.tartibRaqami || 0) - (b.tartibRaqami || 0);
    });
  }, [dillers]);

  const fetchDillers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        ...filters,
        ...(searchValue && { search: searchValue }),
      };
      const response = await dillerService.getAllDillers(params);
      if (response.success) {
        setDillers(response.data || []);
      } else {
        setError(response.message || 'Dillerlarni yuklashda xatolik');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Dillerlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedDiller(null);
    setIsModalOpen(true);
  };

  const handleView = (diller) => {
    setSelectedDiller(diller);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (diller) => {
    setSelectedDiller(diller);
    setIsModalOpen(true);
  };

  const handleDelete = async (diller) => {
    if (!window.confirm(`"${diller.ism} ${diller.familiya}" dillerni o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    try {
      const response = await dillerService.deleteDiller(diller._id);
      if (response.success) {
        fetchDillers();
      } else {
        alert(response.message || 'O\'chirishda xatolik');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'O\'chirishda xatolik');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      let response;
      if (selectedDiller) {
        response = await dillerService.updateDiller(selectedDiller._id, formData);
      } else {
        response = await dillerService.createDiller(formData);
      }

      if (response.success) {
        setIsModalOpen(false);
        setSelectedDiller(null);
        fetchDillers();
      } else {
        alert(response.message || 'Saqlashda xatolik');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Saqlashda xatolik');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dillerlar
          </h1>
          <p className="mt-2 text-sm text-gray-600">Dillerlarni boshqarish va ko'rish</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yangi Diller
        </button>
      </div>

      {/* Filters */}
      <DillerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        searchValue={searchValue}
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
      <DillerTable
        dillers={sortedDillers}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Footer */}
      {!loading && sortedDillers.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm text-gray-600">
            Jami: <span className="font-semibold text-gray-900">{sortedDillers.length}</span> diller
          </span>
        </div>
      )}

      {/* Edit/Create Modal */}
      <DillerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDiller(null);
        }}
        diller={selectedDiller}
        onSubmit={handleSubmit}
        loading={formLoading}
      />

      {/* Detail Modal */}
      <DillerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDiller(null);
        }}
        diller={selectedDiller}
      />
    </div>
  );
};

export default Dillers;
