import React, { useState, useEffect } from 'react';
import { dillerService } from '../../services/dillerService';
import { sotuvchiService } from '../../services/sotuvchiService';
import { configService } from '../../services/configService';
import SearchableSelect from '../Common/SearchableSelect';

const StatistikaFilters = ({ filters, onFilterChange, onDateChange, onApplyFilters, onClearFilters }) => {
  const [dillers, setDillers] = useState([]);
  const [sotuvchilar, setSotuvchilar] = useState([]);
  const [loadingDillers, setLoadingDillers] = useState(false);
  const [loadingSotuvchilar, setLoadingSotuvchilar] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters || {});
  const [foiz, setFoiz] = useState(5);
  const [tempFoiz, setTempFoiz] = useState(5);
  const [loadingFoiz, setLoadingFoiz] = useState(false);
  const [updatingFoiz, setUpdatingFoiz] = useState(false);

  useEffect(() => {
    fetchDillers();
    fetchSotuvchilar();
    fetchFoiz();
  }, []);

  useEffect(() => {
    setTempFilters(filters || {});
  }, [filters]);

  const fetchDillers = async () => {
    try {
      setLoadingDillers(true);
      const response = await dillerService.getAllDillers({ status: 'active' });
      if (response.success) {
        setDillers(response.data || []);
      }
    } catch (err) {
      console.error('Dillerlarni yuklashda xatolik:', err);
    } finally {
      setLoadingDillers(false);
    }
  };

  const fetchSotuvchilar = async () => {
    try {
      setLoadingSotuvchilar(true);
      const response = await sotuvchiService.getAllSotuvchilar({ status: 'active' });
      if (response.success) {
        setSotuvchilar(response.data || []);
      }
    } catch (err) {
      console.error('Sotuvchilarni yuklashda xatolik:', err);
    } finally {
      setLoadingSotuvchilar(false);
    }
  };

  const fetchFoiz = async () => {
    try {
      setLoadingFoiz(true);
      const response = await configService.getFoiz();
      if (response.success && response.data) {
        setFoiz(response.data.foiz || 5);
        setTempFoiz(response.data.foiz || 5);
      }
    } catch (err) {
      console.error('Foizni yuklashda xatolik:', err);
    } finally {
      setLoadingFoiz(false);
    }
  };

  const handleUpdateFoiz = async () => {
    // Validation
    if (tempFoiz === '' || tempFoiz === null || tempFoiz === undefined) {
      alert('Foiz qiymati kiritilishi kerak');
      setTempFoiz(foiz);
      return;
    }

    const foizValue = parseFloat(tempFoiz);
    if (isNaN(foizValue) || foizValue < 0 || foizValue > 100) {
      alert('Foiz 0 va 100 orasida bo\'lishi kerak');
      setTempFoiz(foiz);
      return;
    }

    try {
      setUpdatingFoiz(true);
      const response = await configService.updateFoiz(foizValue);
      if (response.success) {
        setFoiz(foizValue);
        alert('Foiz muvaffaqiyatli yangilandi');
      } else {
        alert(response.message || 'Foizni yangilashda xatolik');
        setTempFoiz(foiz);
      }
    } catch (err) {
      console.error('Foizni yangilashda xatolik:', err);
      alert(err.response?.data?.message || 'Foizni yangilashda xatolik yuz berdi');
      setTempFoiz(foiz);
    } finally {
      setUpdatingFoiz(false);
    }
  };

  const handleInputChange = (field, value) => {
    const newFilters = { ...tempFilters };
    if (value && value !== '') {
      newFilters[field] = value;
    } else {
      delete newFilters[field];
    }
    setTempFilters(newFilters);
  };

  const handleDateInputChange = (field, value) => {
    const newFilters = { ...tempFilters };
    if (value) {
      newFilters[field] = value;
    } else {
      delete newFilters[field];
    }
    setTempFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Bo'sh stringlarni undefined ga o'zgartirish
    const cleanedFilters = { ...tempFilters };
    Object.keys(cleanedFilters).forEach(key => {
      if (cleanedFilters[key] === '' || cleanedFilters[key] === null) {
        delete cleanedFilters[key];
      }
    });
    
    onFilterChange(cleanedFilters);
    if (onApplyFilters) {
      onApplyFilters(cleanedFilters);
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setTempFilters(emptyFilters);
    onFilterChange(emptyFilters);
    onDateChange('startDate', '');
    onDateChange('endDate', '');
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Filter fields */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Keyin (Sana tanlash) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sana Tanlash
          </label>
          <input
            type="date"
            value={tempFilters.keyin && tempFilters.keyin !== 'hammasi' && tempFilters.keyin !== 'all' ? tempFilters.keyin.split('T')[0] : ''}
            onChange={(e) => {
              const value = e.target.value;
              const newFilters = { ...tempFilters };
              if (value) {
                newFilters.keyin = value;
                delete newFilters.startDate;
                delete newFilters.endDate;
              } else {
                delete newFilters.keyin;
              }
              setTempFilters(newFilters);
            }}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                const newFilters = { ...tempFilters };
                newFilters.keyin = 'hammasi';
                delete newFilters.startDate;
                delete newFilters.endDate;
                setTempFilters(newFilters);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tempFilters.keyin === 'hammasi' || tempFilters.keyin === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hammasi
            </button>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                const newFilters = { ...tempFilters };
                newFilters.keyin = today;
                delete newFilters.startDate;
                delete newFilters.endDate;
                setTempFilters(newFilters);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Bugun
            </button>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Boshlang'ich Sana
          </label>
          <input
            type="date"
            value={tempFilters.startDate ? tempFilters.startDate.split('T')[0] : ''}
            onChange={(e) => handleDateInputChange('startDate', e.target.value ? `${e.target.value}T00:00:00.000Z` : '')}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={tempFilters.keyin && tempFilters.keyin !== 'hammasi' && tempFilters.keyin !== 'all'}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tugash Sanasi
          </label>
          <input
            type="date"
            value={tempFilters.endDate ? tempFilters.endDate.split('T')[0] : ''}
            onChange={(e) => handleDateInputChange('endDate', e.target.value ? `${e.target.value}T23:59:59.999Z` : '')}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={tempFilters.keyin && tempFilters.keyin !== 'hammasi' && tempFilters.keyin !== 'all'}
          />
        </div>

        {/* Telefon Raqami */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mijoz Telefon Raqami
          </label>
          <input
            type="text"
            value={tempFilters.telefonRaqami || ''}
            onChange={(e) => handleInputChange('telefonRaqami', e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="998942330690"
          />
        </div>

        {/* Diller */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diller
          </label>
          <SearchableSelect
            value={tempFilters.dillerId || ''}
            onChange={(value) => handleInputChange('dillerId', value)}
            options={dillers}
            placeholder="Barchasi"
            loading={loadingDillers}
            getOptionLabel={(diller) => `${diller.tartibRaqami} - ${diller.ism} ${diller.familiya}`}
            getOptionValue={(diller) => diller._id}
            renderOption={(diller, isSelected) => (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold ${
                  isSelected
                    ? 'bg-blue-200 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {diller.tartibRaqami}
                </span>
                <span className="text-sm font-medium">{diller.ism} {diller.familiya}</span>
              </div>
            )}
          />
        </div>

        {/* Sotuvchi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sotuvchi
          </label>
          <SearchableSelect
            value={tempFilters.sotuvchiId || ''}
            onChange={(value) => handleInputChange('sotuvchiId', value)}
            options={sotuvchilar}
            placeholder="Barchasi"
            loading={loadingSotuvchilar}
            getOptionLabel={(sotuvchi) => `${sotuvchi.tartibRaqami} - ${sotuvchi.ism} ${sotuvchi.familiya}`}
            getOptionValue={(sotuvchi) => sotuvchi._id}
            renderOption={(sotuvchi, isSelected) => (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold ${
                  isSelected
                    ? 'bg-blue-200 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {sotuvchi.tartibRaqami}
                </span>
                <span className="text-sm font-medium">{sotuvchi.ism} {sotuvchi.familiya}</span>
              </div>
            )}
          />
        </div>
        </div>

        {/* Right side - Foiz configuration and Action buttons */}
        <div className="lg:w-80 flex flex-col gap-4">
          {/* Foiz Configuration */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Foiz Konfiguratsiyasi
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={tempFoiz}
                onChange={(e) => setTempFoiz(e.target.value)}
                disabled={loadingFoiz || updatingFoiz}
                className="flex-1 px-4 py-2.5 border border-purple-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="5.0"
              />
              <span className="text-sm font-medium text-gray-600">%</span>
              <button
                onClick={handleUpdateFoiz}
                disabled={loadingFoiz || updatingFoiz || tempFoiz === '' || parseFloat(tempFoiz) === foiz || isNaN(parseFloat(tempFoiz))}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Foizni yangilash"
              >
                {updatingFoiz ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Joriy foiz: <span className="font-semibold text-purple-700">{foiz}%</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Excel exportda ishlatiladi
            </p>
          </div>

          {/* Apply and Clear Filters */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleApplyFilters}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Filterlash
            </button>
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Tozalash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatistikaFilters;
