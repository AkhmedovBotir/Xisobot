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
        ['📦 Buyurtmalar'],
        ['📊 Statistika', '⚙️ Sozlamalar'],
      ],
      resize_keyboard: true,
      persistent: true,
    },
  };
}

// Buyurtmalar submenu keyboard
function getBuyurtmalarMenuKeyboard(hasMultipleDillerlar = false) {
  const keyboard = [
    ['📋 Mening buyurtmalarim'],
    ['➕ Buyurtma qo\'shish'],
  ];
  
  // Add diller selection button if multiple dillerlar
  if (hasMultipleDillerlar) {
    keyboard.push(['🔄 Diller tanlash']);
  }
  
  keyboard.push(['🔙 Asosiy menyu']);
  
  return {
    reply_markup: {
      keyboard,
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

// Confirm or cancel keyboard
function getConfirmCancelKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        ['✅ Tasdiqlash'],
        ['❌ Bekor qilish'],
      ],
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

// Diller selection keyboard (dynamic - based on dillerlar list)
function getDillerSelectionKeyboard(dillerlar) {
  const buttons = [];
  
  // Create buttons in rows of 2
  for (let i = 0; i < dillerlar.length; i += 2) {
    const row = [];
    row.push(`📋 ${dillerlar[i].ism} ${dillerlar[i].familiya} (${dillerlar[i].tartibRaqami})`);
    if (i + 1 < dillerlar.length) {
      row.push(`📋 ${dillerlar[i + 1].ism} ${dillerlar[i + 1].familiya} (${dillerlar[i + 1].tartibRaqami})`);
    }
    buttons.push(row);
  }
  
  // Add back button
  buttons.push(['🔙 Asosiy menyu']);
  
  return {
    reply_markup: {
      keyboard: buttons,
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
  getBuyurtmalarMenuKeyboard,
  getBackToMainMenuKeyboard,
  getCancelKeyboard,
  getConfirmCancelKeyboard,
  getRetryKeyboard,
  getDillerSelectionKeyboard,
  getStatistikaPeriodKeyboard,
};
