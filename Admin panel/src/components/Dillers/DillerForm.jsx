import React, { useState, useEffect } from 'react';
import { handlePhoneInput, validatePhoneNumber } from '../../utils/phoneFormatter';

const DillerForm = ({ diller, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    ism: '',
    familiya: '',
    telefonRaqam: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (diller) {
      setFormData({
        ism: diller.ism || '',
        familiya: diller.familiya || '',
        telefonRaqam: diller.telefonRaqam || '',
        status: diller.status || 'active',
      });
    }
  }, [diller]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.ism.trim()) {
      newErrors.ism = 'Ism majburiy';
    }
    if (!formData.familiya.trim()) {
      newErrors.familiya = 'Familiya majburiy';
    }
    if (!formData.telefonRaqam.trim()) {
      newErrors.telefonRaqam = 'Telefon raqam majburiy';
    } else if (!validatePhoneNumber(formData.telefonRaqam)) {
      newErrors.telefonRaqam = 'Telefon raqam formati: +998901234567';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ism */}
      <div>
        <label htmlFor="ism" className="block text-sm font-medium text-gray-700 mb-2">
          Ism <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="ism"
          name="ism"
          value={formData.ism}
          onChange={handleChange}
          className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            errors.ism ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Ismni kiriting"
        />
        {errors.ism && (
          <p className="mt-1 text-sm text-red-600">{errors.ism}</p>
        )}
      </div>

      {/* Familiya */}
      <div>
        <label htmlFor="familiya" className="block text-sm font-medium text-gray-700 mb-2">
          Familiya <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="familiya"
          name="familiya"
          value={formData.familiya}
          onChange={handleChange}
          className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            errors.familiya ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Familiyani kiriting"
        />
        {errors.familiya && (
          <p className="mt-1 text-sm text-red-600">{errors.familiya}</p>
        )}
      </div>

      {/* Telefon Raqam */}
      <div>
        <label htmlFor="telefonRaqam" className="block text-sm font-medium text-gray-700 mb-2">
          Telefon Raqam <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <input
            type="text"
            id="telefonRaqam"
            name="telefonRaqam"
            value={formData.telefonRaqam}
            onChange={(e) => {
              handlePhoneInput(e, (value) => {
                setFormData((prev) => ({
                  ...prev,
                  telefonRaqam: value,
                }));
                if (errors.telefonRaqam) {
                  setErrors((prev) => ({
                    ...prev,
                    telefonRaqam: '',
                  }));
                }
              });
            }}
            className={`block w-full pl-12 pr-4 py-3 border rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.telefonRaqam ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+998901234567"
            maxLength={13}
          />
        </div>
        {errors.telefonRaqam && (
          <p className="mt-1 text-sm text-red-600">{errors.telefonRaqam}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Format: +998901234567</p>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saqlanmoqda...
            </span>
          ) : (
            diller ? 'Yangilash' : 'Yaratish'
          )}
        </button>
      </div>
    </form>
  );
};

export default DillerForm;
