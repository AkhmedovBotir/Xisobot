import React from 'react';

const PaymentDetailModal = ({ isOpen, onClose, payment }) => {
  if (!isOpen || !payment) return null;

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
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">
                  To'lov Tranzaksiyasi
                </h3>
                {payment.yangi && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                    Yangi
                  </span>
                )}
              </div>
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
              {/* Operatsiya Raqami */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Operatsiya Raqami
                </label>
                <p className="text-2xl font-bold text-gray-900">{payment.operatsiyaRaqami}</p>
              </div>

              {/* Mijoz Ma'lumotlari */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Mijoz Ismi
                  </label>
                  <p className="text-base font-semibold text-gray-900">{payment.mijozIsmi}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Telefon Raqami
                  </label>
                  <p className="text-base font-semibold text-gray-900">{payment.mijozTelefonRaqami}</p>
                </div>
              </div>

              {/* Summa Ma'lumotlari */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Summa
                  </label>
                  <p className="text-xl font-bold text-green-700">{payment.summa}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Hisobga O'tkazilgan
                  </label>
                  <p className="text-xl font-bold text-blue-700">{payment.hisobgaOtkazilganSumma}</p>
                </div>
              </div>

              {/* Terminal va Merchant */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Tranzaksiya ID
                  </label>
                  <p className="text-sm font-semibold text-gray-900">{payment.tranzaksiyaId}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Terminal ID
                  </label>
                  <p className="text-sm font-semibold text-gray-900">{payment.terminalId}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Merchant ID
                  </label>
                  <p className="text-sm font-semibold text-gray-900">{payment.merchantId}</p>
                </div>
              </div>

              {/* Muddat va Vaqt */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Muddat
                  </label>
                  <p className="text-base font-semibold text-gray-900">{payment.muddat}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Vaqt
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(payment.vaqt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(payment.vaqt).toLocaleTimeString('uz-UZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Do'kon Manzili */}
              {payment.dokonManzili && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Do'kon Manzili
                  </label>
                  <p className="text-base font-semibold text-gray-900">{payment.dokonManzili}</p>
                </div>
              )}

              {/* Yaratilgan va Yangilangan */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Yaratilgan
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(payment.createdAt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(payment.createdAt).toLocaleTimeString('uz-UZ', {
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
                    {new Date(payment.updatedAt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(payment.updatedAt).toLocaleTimeString('uz-UZ', {
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

export default PaymentDetailModal;
