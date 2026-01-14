import React from 'react';

const DillerDetailModal = ({ isOpen, onClose, diller }) => {
  if (!isOpen || !diller) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Diller Ma'lumotlari
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Tartib Raqami */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Tartib Raqami
                </label>
                <p className="text-2xl font-bold text-gray-900">{diller.tartibRaqami}</p>
              </div>

              {/* Ism va Familiya */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Ism
                  </label>
                  <p className="text-base font-semibold text-gray-900">{diller.ism}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Familiya
                  </label>
                  <p className="text-base font-semibold text-gray-900">{diller.familiya}</p>
                </div>
              </div>

              {/* Telefon Raqam */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Telefon Raqam
                </label>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-base font-semibold text-gray-900">{diller.telefonRaqam}</p>
                </div>
              </div>

              {/* Status */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Status
                </label>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  diller.status === 'active'
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                    : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
                }`}>
                  {diller.status === 'active' ? 'Faol' : 'Nofaol'}
                </span>
              </div>

              {/* Yaratilgan va Yangilangan */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Yaratilgan
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(diller.createdAt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(diller.createdAt).toLocaleTimeString('uz-UZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Yangilangan
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(diller.updatedAt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(diller.updatedAt).toLocaleTimeString('uz-UZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DillerDetailModal;
