import React from 'react';

const StatistikaDetailModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Statistika Ma'lumotlari
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
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Xaridor Ma'lumotlari */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Xaridor Ismi
                  </label>
                  <p className="text-base font-semibold text-gray-900">{item.xaridorIsmi}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Xaridor Familiyasi
                  </label>
                  <p className="text-base font-semibold text-gray-900">{item.xaridorFamiliyasi || '-'}</p>
                </div>
              </div>

              {/* Telefon Raqami */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Telefon Raqami
                </label>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-base font-semibold text-gray-900">{item.telefonRaqami}</p>
                </div>
              </div>

              {/* Summa Ma'lumotlari */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Summa
                  </label>
                  <p className="text-xl font-bold text-green-700">{item.summa}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Qolgan Summa
                  </label>
                  <p className="text-xl font-bold text-red-700">{item.qolganSummaFormatted}</p>
                </div>
              </div>

              {/* Sotuvchi va Diller */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Sotuvchi
                  </label>
                  {item.sotuvchi ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold text-xs border border-blue-200">
                          {item.sotuvchi.tartibRaqami}
                        </span>
                        <p className="text-base font-semibold text-gray-900">{item.sotuvchi.fullName}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">-</p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Diller
                  </label>
                  {item.diller ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold text-xs border border-purple-200">
                          {item.diller.tartibRaqami}
                        </span>
                        <p className="text-base font-semibold text-gray-900">{item.diller.fullName}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">-</p>
                  )}
                </div>
              </div>

              {/* Shartnoma va Tranzaksiya */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Shartnoma Raqami
                  </label>
                  <p className="text-base font-semibold text-gray-900">{item.shartnomaRaqami}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Tranzaksiya ID
                  </label>
                  <p className="text-base font-semibold text-gray-900">{item.tranzaksiyaId}</p>
                </div>
              </div>

              {/* Vaqt */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Vaqt
                </label>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(item.vaqt).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(item.vaqt).toLocaleTimeString('uz-UZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
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

export default StatistikaDetailModal;
