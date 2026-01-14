// Request phone number keyboard
function getPhoneKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [
          {
            text: '📱 Telefon raqamni yuborish',
            request_contact: true,
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Main menu keyboard (after registration)
function getMainMenuKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        ['👥 Sotuvchilar'],
        ['📊 Statistika', '⚙️ Sozlamalar'],
      ],
      resize_keyboard: true,
      persistent: true,
    },
  };
}

// Sotuvchilar submenu keyboard (inline format but regular keyboard)
function getSotuvchilarMenuKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        ['📋 Mening sotuvchilarim'],
        ['➕ Sotuvchi qo\'shish'],
        ['🔙 Asosiy menyu'],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Back to main menu keyboard
function getBackToMainMenuKeyboard() {
  return {
    reply_markup: {
      keyboard: [['🔙 Asosiy menyu']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Cancel button keyboard
function getCancelKeyboard() {
  return {
    reply_markup: {
      keyboard: [['❌ Bekor qilish']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Retry keyboard (for input errors)
function getRetryKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        ['🔄 Qayta so\'rash'],
        ['❌ Bekor qilish'],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Statistika period selection keyboard
function getStatistikaPeriodKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        ['📊 Bugungi', '📊 Kechagi'],
        ['📊 Haftalik', '📊 Oylik'],
        ['🔙 Asosiy menyu'],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

module.exports = {
  getPhoneKeyboard,
  getMainMenuKeyboard,
  getSotuvchilarMenuKeyboard,
  getBackToMainMenuKeyboard,
  getCancelKeyboard,
  getRetryKeyboard,
  getStatistikaPeriodKeyboard,
};
