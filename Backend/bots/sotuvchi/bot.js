const TelegramBot = require('node-telegram-bot-api');
const Sotuvchi = require('../../models/Sotuvchi');
const Diller = require('../../models/Diller');
const PaymentTransaction = require('../../models/PaymentTransaction');
const { States, getUserState, setUserState, clearUserState, updateUserData } = require('./stateManager');
const {
  getPhoneKeyboard,
  getMainMenuKeyboard,
  getBuyurtmalarMenuKeyboard,
  getBackToMainMenuKeyboard,
  getCancelKeyboard,
  getConfirmCancelKeyboard,
  getRetryKeyboard,
  getDillerSelectionKeyboard,
  getStatistikaPeriodKeyboard,
} = require('./keyboards');
require('dotenv').config();

// Initialize bot - errors won't crash other bots
const token = process.env.SOTUVCHI_BOT_TOKEN;
let bot;

if (!token) {
  console.error('❌ SOTUVCHI_BOT_TOKEN not found in .env file');
  console.error('   Sotuvchi bot will not start, but other bots will continue');
} else {
  try {
    bot = new TelegramBot(token, { 
      polling: {
        interval: 300, // Polling interval in ms
        autoStart: true,
        params: {
          timeout: 10, // Long polling timeout
        },
      },
    });
    console.log('Sotuvchi Telegram bot started...');
  } catch (error) {
    console.error('❌ Failed to initialize Sotuvchi bot:', error.message);
    console.error('   Other bots will continue to work');
  }
}

// Store last message ID for editing - thread-safe for concurrent users
// Each user has isolated message ID storage
const lastMessageIds = new Map();

// Helper function to format phone number
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with country code, keep it, otherwise add 998
  if (cleaned.startsWith('998')) {
    return '+' + cleaned;
  } else {
    // Assume it's local number, add 998
    return '+998' + cleaned;
  }
}

// Helper function to normalize phone for search (942330690 -> 998942330690)
function normalizePhoneForSearch(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    // Local format: 942330690 -> 998942330690
    return '+998' + cleaned;
  } else if (cleaned.startsWith('998')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('+998')) {
    return cleaned;
  }
  return '+998' + cleaned;
}

// Helper function to check if phone number matches Sotuvchi
async function checkPhoneNumber(phoneNumber) {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const sotuvchi = await Sotuvchi.findOne({ telefonRaqam: formattedPhone });
    return sotuvchi;
  } catch (error) {
    console.error('Error checking phone number:', error);
    return null;
  }
}

// Helper function to get registered Sotuvchi by Telegram ID
async function getSotuvchiByTelegramId(telegramUserId) {
  try {
    const sotuvchi = await Sotuvchi.findOne({ telegramUserId });
    return sotuvchi;
  } catch (error) {
    console.error('Error getting sotuvchi by telegram ID:', error);
    return null;
  }
}

// Helper function to send or edit message
async function sendOrEditMessage(chatId, text, keyboard, messageId = null) {
  try {
    // Handle inline keyboard format
    let replyMarkup = null;
    if (keyboard && keyboard.reply_markup) {
      replyMarkup = keyboard.reply_markup;
    } else if (keyboard && keyboard.inline_keyboard) {
      replyMarkup = keyboard;
    } else if (keyboard) {
      replyMarkup = keyboard;
    }

    if (messageId) {
      // Edit existing message
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup,
      });
      return messageId;
    } else {
      // Send new message
      const sent = await bot.sendMessage(chatId, text, {
        reply_markup: replyMarkup
      });
      return sent.message_id;
    }
  } catch (error) {
    // If edit fails (message not found), send new message
    if (error.response && error.response.statusCode === 400) {
      const sent = await bot.sendMessage(chatId, text, {
        reply_markup: keyboard && (keyboard.reply_markup || keyboard.inline_keyboard || keyboard)
      });
      return sent.message_id;
    }
    throw error;
  }
}

// Helper function to format transaction details
function formatTransactionDetails(transaction) {
  const vaqt = new Date(transaction.vaqt);
  const formattedDate = vaqt.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    `📋 Buyurtma ma'lumotlari:\n\n` +
    `👤 Mijoz ismi: ${transaction.mijozIsmi}\n` +
    `📱 Mijoz telefon raqami: ${transaction.mijozTelefonRaqami}\n` +
    `📅 Muddat: ${transaction.muddat}\n` +
    `🕐 Vaqt: ${formattedDate}\n` +
    `💰 Summa: ${transaction.summa} UZS\n` +
    `💵 Hisobga o'tkazilgan summa: ${transaction.hisobgaOtkazilganSumma} UZS\n` +
    `🆔 Tranzaksiya ID: ${transaction.tranzaksiyaId}\n` +
    `🖥️ Terminal ID: ${transaction.terminalId}\n` +
    `📦 Operatsiya raqami: ${transaction.operatsiyaRaqami}`
  );
}

// Helper function to parse summa string to number
function parseSumma(summaString) {
  if (!summaString) return 0;
  // Remove "UZS", spaces, commas, and convert to number
  // Example: "4,800,000.00 UZS" -> 4800000.00
  const cleaned = summaString.replace(/UZS|,/g, '').trim();
  return parseFloat(cleaned) || 0;
}

// Helper function to format number to UZS with commas
function formatSumma(number) {
  return number.toLocaleString('uz-UZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' UZS';
}

// Helper function to get date range for statistics
function getDateRange(period) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(todayEnd);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
  
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);
  
  switch (period) {
    case 'today':
      return { start: todayStart, end: now };
    case 'yesterday':
      return { start: yesterdayStart, end: yesterdayEnd };
    case 'week':
      return { start: weekStart, end: now };
    case 'month':
      return { start: monthStart, end: now };
    default:
      return { start: null, end: null };
  }
}

// Helper function to show buyurtmalar for a specific diller and sotuvchi
async function showBuyurtmalarForDiller(chatId, userId, sotuvchiId, dillerId, hasMultipleDillerlar = false) {
  try {
    // Get diller info
    const diller = await Diller.findById(dillerId);
    if (!diller) {
      const messageId = lastMessageIds.get(userId);
      const newMessageId = await sendOrEditMessage(
        chatId,
        '❌ Diller topilmadi.',
        getBuyurtmalarMenuKeyboard(hasMultipleDillerlar),
        messageId
      );
      lastMessageIds.set(userId, newMessageId);
      return;
    }
    
    // Find all Sotuvchilar that have this Diller in their dillerlar array
    // This is more reliable than using diller.sotuvchilar
    const dillerSotuvchilar = await Sotuvchi.find({
      dillerlar: dillerId
    }).select('_id');
    
    const dillerSotuvchilarIds = dillerSotuvchilar.map(s => s._id);
    
    // If no sotuvchilar found for this diller, show empty message
    if (dillerSotuvchilarIds.length === 0) {
      const messageId = lastMessageIds.get(userId);
      const newMessageId = await sendOrEditMessage(
        chatId,
        `📋 "${diller.ism} ${diller.familiya}" dilleri uchun hozircha buyurtmalar mavjud emas.\n\n` +
        'Buyurtma qo\'shish uchun "➕ Buyurtma qo\'shish" tugmasini bosing.',
        getBuyurtmalarMenuKeyboard(hasMultipleDillerlar),
        messageId
      );
      lastMessageIds.set(userId, newMessageId);
      return;
    }
    
    // Get buyurtmalar filtered by all Sotuvchilar that belong to the selected Diller
    // This shows orders for all people served by this dealer
    const buyurtmalar = await PaymentTransaction.find({
      sotuvchiId: { $in: dillerSotuvchilarIds },
    })
      .sort({ vaqt: -1 })
      .limit(20);

    if (buyurtmalar.length === 0) {
      const messageId = lastMessageIds.get(userId);
      const newMessageId = await sendOrEditMessage(
        chatId,
        `📋 "${diller.ism} ${diller.familiya}" dilleri uchun hozircha buyurtmalar mavjud emas.\n\n` +
        'Buyurtma qo\'shish uchun "➕ Buyurtma qo\'shish" tugmasini bosing.',
        getBuyurtmalarMenuKeyboard(hasMultipleDillerlar),
        messageId
      );
      lastMessageIds.set(userId, newMessageId);
      return;
    }

    let message = `📋 "${diller.ism} ${diller.familiya}" dilleri buyurtmalari:\n\n`;
    buyurtmalar.forEach((buyurtma, index) => {
      const vaqt = new Date(buyurtma.vaqt);
      const formattedDate = vaqt.toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      
      message += `${index + 1}. ${buyurtma.mijozIsmi}\n`;
      message += `   📱 ${buyurtma.mijozTelefonRaqami}\n`;
      message += `   💰 ${buyurtma.summa} UZS\n`;
      message += `   🕐 ${formattedDate}\n`;
      message += `   🆔 ${buyurtma.tranzaksiyaId}\n\n`;
    });

    const messageId = lastMessageIds.get(userId);
    const newMessageId = await sendOrEditMessage(
      chatId,
      message,
      getBuyurtmalarMenuKeyboard(hasMultipleDillerlar),
      messageId
    );
    lastMessageIds.set(userId, newMessageId);
  } catch (error) {
    console.error('Error showing buyurtmalar for diller:', error);
    const messageId = lastMessageIds.get(userId);
    const newMessageId = await sendOrEditMessage(
      chatId,
      '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.',
      getBuyurtmalarMenuKeyboard(hasMultipleDillerlar),
      messageId
    );
    lastMessageIds.set(userId, newMessageId);
  }
}

// Start command - Registration flow
if (bot) {
  bot.onText(/\/start/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if user is already registered
    const existingSotuvchi = await getSotuvchiByTelegramId(userId);
    
    if (existingSotuvchi) {
      // User is registered, show main menu
      const sent = await bot.sendMessage(
        chatId,
        `👋 Salom, ${existingSotuvchi.ism} ${existingSotuvchi.familiya}!\n\n` +
        `Siz allaqachon ro'yxatdan o'tgansiz.`,
        getMainMenuKeyboard()
      );
      lastMessageIds.set(userId, sent.message_id);
      setUserState(userId, States.REGISTERED, { sotuvchiId: existingSotuvchi._id });
      return;
    }

    // Start registration
    clearUserState(userId);
    setUserState(userId, States.WAITING_FOR_ISM);
    
    await bot.sendMessage(
      chatId,
      '👋 Salom! Ro\'yxatdan o\'tish uchun quyidagi ma\'lumotlarni kiriting:\n\n' +
      '📝 Ismingizni kiriting:',
      { reply_markup: { remove_keyboard: true } }
    );
  } catch (error) {
    console.error('Error in /start command:', error);
  }
  });
}

// Handle text messages - supports concurrent users
if (bot) {
  bot.on('message', async (msg) => {
  // Each message is handled independently, allowing concurrent processing
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    const state = getUserState(userId);

    // Skip if message is a command
    if (text && text.startsWith('/')) {
      return;
    }

    // Handle cancel
    if (text === '❌ Bekor qilish') {
      clearUserState(userId);
      const messageId = lastMessageIds.get(userId);
      const newMessageId = await sendOrEditMessage(
        chatId,
        '❌ Amal bekor qilindi.',
        { reply_markup: { remove_keyboard: true } },
        messageId
      );
      lastMessageIds.set(userId, newMessageId);
      return;
    }

    // Handle retry
    if (text === '🔄 Qayta so\'rash') {
      // Retry based on current state
      const currentState = getUserState(userId);
      if (currentState.state === States.WAITING_FOR_ISM) {
        await bot.sendMessage(chatId, '📝 Ismingizni kiriting:', getRetryKeyboard());
        return;
      } else if (currentState.state === States.WAITING_FOR_FAMILIYA) {
        await bot.sendMessage(chatId, '📝 Familiyangizni kiriting:', getRetryKeyboard());
        return;
      } else if (currentState.state === States.WAITING_FOR_PHONE) {
        await bot.sendMessage(chatId, '📱 Telefon raqamingizni yuboring:', getPhoneKeyboard());
        return;
      } else if (currentState.state === States.ADDING_BUYURTMA_PHONE) {
        await bot.sendMessage(chatId, '📱 Mijoz telefon raqamini kiriting:\nMasalan: 901234567 (998 qo\'shilmaydi)', getRetryKeyboard());
        return;
      }
    }

    // Registration flow
    if (state.state === States.WAITING_FOR_ISM) {
      if (!text || text.trim().length < 2) {
        await bot.sendMessage(chatId, '❌ Ism kamida 2 ta belgidan iborat bo\'lishi kerak. Qayta kiriting:', getRetryKeyboard());
        return;
      }
      updateUserData(userId, { ism: text.trim() });
      setUserState(userId, States.WAITING_FOR_FAMILIYA);
      await bot.sendMessage(chatId, '📝 Familiyangizni kiriting:', getRetryKeyboard());
      return;
    }

    if (state.state === States.WAITING_FOR_FAMILIYA) {
      if (!text || text.trim().length < 2) {
        await bot.sendMessage(chatId, '❌ Familiya kamida 2 ta belgidan iborat bo\'lishi kerak. Qayta kiriting:', getRetryKeyboard());
        return;
      }
      updateUserData(userId, { familiya: text.trim() });
      setUserState(userId, States.WAITING_FOR_PHONE);
      await bot.sendMessage(
        chatId,
        '📱 Telefon raqamingizni yuboring:',
        getPhoneKeyboard()
      );
      return;
    }

    if (state.state === States.WAITING_FOR_PHONE) {
      // Phone validation is handled in the contact/text handler below
    }

    // Handle phone number from contact or text
    if (state.state === States.WAITING_FOR_PHONE) {
      let phoneNumber = null;

      if (msg.contact && msg.contact.phone_number) {
        phoneNumber = msg.contact.phone_number;
      } else if (text) {
        phoneNumber = text.trim();
      }

      if (!phoneNumber) {
        await bot.sendMessage(
          chatId,
          '❌ Telefon raqam topilmadi. Iltimos, telefon raqamingizni yuboring:',
          getPhoneKeyboard()
        );
        return;
      }

      // Check if phone number exists in Sotuvchi database
      const sotuvchi = await checkPhoneNumber(phoneNumber);
      
      if (!sotuvchi) {
        await bot.sendMessage(
          chatId,
          '❌ Bu telefon raqam bazada topilmadi. Iltimos, admin bilan bog\'laning.',
          { reply_markup: { remove_keyboard: true } }
        );
        clearUserState(userId);
        return;
      }

      // Check if this Sotuvchi is already registered with another Telegram account
      if (sotuvchi.telegramUserId && sotuvchi.telegramUserId !== userId) {
        await bot.sendMessage(
          chatId,
          '❌ Bu telefon raqam boshqa Telegram akkaunt bilan bog\'langan.',
          { reply_markup: { remove_keyboard: true } }
        );
        clearUserState(userId);
        return;
      }

      // Update Sotuvchi with Telegram info
      const formattedPhone = formatPhoneNumber(phoneNumber);
      sotuvchi.telegramChatId = chatId;
      sotuvchi.telegramUserId = userId;
      await sotuvchi.save();

      setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
      
      const sent = await bot.sendMessage(
        chatId,
        `✅ Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!\n\n` +
        `👤 Ism: ${sotuvchi.ism}\n` +
        `👤 Familiya: ${sotuvchi.familiya}\n` +
        `📱 Telefon: ${sotuvchi.telefonRaqam}\n` +
        `🆔 Tartib raqami: ${sotuvchi.tartibRaqami}\n\n` +
        `Asosiy menyu:`,
        getMainMenuKeyboard()
      );
      lastMessageIds.set(userId, sent.message_id);
      return;
    }

    // Handle main menu options
    if (state.state === States.REGISTERED) {
      if (text === '📦 Buyurtmalar') {
        const sotuvchi = await getSotuvchiByTelegramId(userId);
        if (!sotuvchi) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '❌ Xatolik yuz berdi.',
            getBackToMainMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        // Populate dillerlar
        await sotuvchi.populate('dillerlar');
        const dillerlar = sotuvchi.dillerlar || [];

        // If no dillerlar, show message
        if (dillerlar.length === 0) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '📦 Sizga hozircha diller biriktirilmagan.\n\n' +
            'Iltimos, diller bilan bog\'laning.',
            getBackToMainMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        // If only one diller, show buyurtmalar menu directly
        if (dillerlar.length === 1) {
          const selectedDiller = dillerlar[0];
          updateUserData(userId, { selectedDillerId: selectedDiller._id });
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '📦 Buyurtmalar bo\'limi:',
            getBuyurtmalarMenuKeyboard(false),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        // If multiple dillerlar, ask to select
        setUserState(userId, States.SELECTING_DILLER);
        updateUserData(userId, { forBuyurtmalar: true });
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '📦 Buyurtmalar bo\'limi uchun dillerni tanlang:',
          getDillerSelectionKeyboard(dillerlar),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      if (text === '🔄 Diller tanlash') {
        const sotuvchi = await getSotuvchiByTelegramId(userId);
        if (!sotuvchi) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '❌ Xatolik yuz berdi.',
            getBackToMainMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        await sotuvchi.populate('dillerlar');
        const dillerlar = sotuvchi.dillerlar || [];

        if (dillerlar.length <= 1) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            'ℹ️ Sizga faqat bitta diller biriktirilgan.',
            getBuyurtmalarMenuKeyboard(false),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        setUserState(userId, States.SELECTING_DILLER);
        updateUserData(userId, { forBuyurtmalar: true });
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '📦 Buyurtmalar bo\'limi uchun dillerni tanlang:',
          getDillerSelectionKeyboard(dillerlar),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      if (text === '📋 Mening buyurtmalarim') {
        const sotuvchi = await getSotuvchiByTelegramId(userId);
        if (!sotuvchi) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '❌ Xatolik yuz berdi.',
            getBackToMainMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        // Get selected diller from state
        const currentState = getUserState(userId);
        const selectedDillerId = currentState.data.selectedDillerId;

        if (!selectedDillerId) {
          // If no diller selected, check dillerlar
          await sotuvchi.populate('dillerlar');
          const dillerlar = sotuvchi.dillerlar || [];

          if (dillerlar.length === 0) {
            const messageId = lastMessageIds.get(userId);
            const newMessageId = await sendOrEditMessage(
              chatId,
              '📋 Sizga hozircha diller biriktirilmagan.\n\n' +
              'Iltimos, diller bilan bog\'laning.',
              getBuyurtmalarMenuKeyboard(dillerlar.length > 1),
              messageId
            );
            lastMessageIds.set(userId, newMessageId);
            return;
          }

          if (dillerlar.length === 1) {
            const selectedDiller = dillerlar[0];
            updateUserData(userId, { selectedDillerId: selectedDiller._id });
            await showBuyurtmalarForDiller(chatId, userId, sotuvchi._id, selectedDiller._id, dillerlar.length > 1);
            return;
          }

          // Multiple dillerlar - ask to select
          setUserState(userId, States.SELECTING_DILLER);
          updateUserData(userId, { forBuyurtmalar: true });
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '📋 Buyurtmalarni ko\'rish uchun dillerni tanlang:',
            getDillerSelectionKeyboard(dillerlar),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        // Use selected diller
        await sotuvchi.populate('dillerlar');
        const dillerlar = sotuvchi.dillerlar || [];
        await showBuyurtmalarForDiller(chatId, userId, sotuvchi._id, selectedDillerId, dillerlar.length > 1);
        return;
      }

      if (text === '➕ Buyurtma qo\'shish') {
        const sotuvchi = await getSotuvchiByTelegramId(userId);
        if (!sotuvchi) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '❌ Xatolik yuz berdi.',
            getBackToMainMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        await sotuvchi.populate('dillerlar');
        const dillerlar = sotuvchi.dillerlar || [];
        
        setUserState(userId, States.ADDING_BUYURTMA_PHONE);
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '➕ Yangi buyurtma qo\'shish:\n\n' +
          '📱 Mijoz telefon raqamini kiriting:\n' +
          'Masalan: 901234567 (998 qo\'shilmaydi)',
          getCancelKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      if (text === '🔙 Asosiy menyu') {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '🏠 Asosiy menyu:',
          getMainMenuKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      if (text === '📊 Statistika') {
        const sotuvchi = await getSotuvchiByTelegramId(userId);
        if (sotuvchi) {
          // Populate dillerlar
          await sotuvchi.populate('dillerlar');
          const dillerlar = sotuvchi.dillerlar || [];

          // If no dillerlar, show message
          if (dillerlar.length === 0) {
            const messageId = lastMessageIds.get(userId);
            const newMessageId = await sendOrEditMessage(
              chatId,
              '📊 Sizga hozircha diller biriktirilmagan.\n\n' +
              'Iltimos, diller bilan bog\'laning.',
              getBackToMainMenuKeyboard(),
              messageId
            );
            lastMessageIds.set(userId, newMessageId);
            return;
          }

          // If only one diller, show statistics period selection
          if (dillerlar.length === 1) {
            const selectedDiller = dillerlar[0];
            updateUserData(userId, { selectedDillerId: selectedDiller._id });
            const messageId = lastMessageIds.get(userId);
            const newMessageId = await sendOrEditMessage(
              chatId,
              '📊 Statistika davrini tanlang:',
              getStatistikaPeriodKeyboard(),
              messageId
            );
            lastMessageIds.set(userId, newMessageId);
            return;
          }

          // If multiple dillerlar, ask to select
          setUserState(userId, States.SELECTING_DILLER);
          updateUserData(userId, { forStatistika: true });
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '📊 Statistika ko\'rish uchun dillerni tanlang:',
            getDillerSelectionKeyboard(dillerlar),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
        }
        return;
      }

      // Handle statistika period selection
      if (text === '📊 Bugungi' || text === '📊 Kechagi' || text === '📊 Haftalik' || text === '📊 Oylik') {
        const sotuvchi = await getSotuvchiByTelegramId(userId);
        if (!sotuvchi) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '❌ Xatolik yuz berdi.',
            getBackToMainMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        const currentState = getUserState(userId);
        const selectedDillerId = currentState.data.selectedDillerId;

        if (!selectedDillerId) {
          await sotuvchi.populate('dillerlar');
          const dillerlar = sotuvchi.dillerlar || [];
          
          if (dillerlar.length === 1) {
            const selectedDiller = dillerlar[0];
            updateUserData(userId, { selectedDillerId: selectedDiller._id });
            
            let period = 'all';
            if (text === '📊 Bugungi') period = 'today';
            else if (text === '📊 Kechagi') period = 'yesterday';
            else if (text === '📊 Haftalik') period = 'week';
            else if (text === '📊 Oylik') period = 'month';
            
            await showStatistikaForDiller(chatId, userId, sotuvchi._id, selectedDiller._id, sotuvchi.tartibRaqami, period);
            return;
          }
        } else {
          let period = 'all';
          if (text === '📊 Bugungi') period = 'today';
          else if (text === '📊 Kechagi') period = 'yesterday';
          else if (text === '📊 Haftalik') period = 'week';
          else if (text === '📊 Oylik') period = 'month';
          
          await showStatistikaForDiller(chatId, userId, sotuvchi._id, selectedDillerId, sotuvchi.tartibRaqami, period);
          return;
        }
      }

      if (text === '⚙️ Sozlamalar') {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '⚙️ Sozlamalar bo\'limi hozircha mavjud emas.',
          getBackToMainMenuKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }
    }

    // Handle adding buyurtma by phone
    if (state.state === States.ADDING_BUYURTMA_PHONE) {
      if (!text || !text.trim()) {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '❌ Telefon raqam kiritilmadi. Qayta kiriting:\n' +
          'Masalan: 901234567',
          getRetryKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      const phoneInput = text.trim();
      
      // Validate format (9 digits)
      if (!/^\d{9}$/.test(phoneInput)) {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '❌ Noto\'g\'ri format. Telefon raqam 9 ta raqamdan iborat bo\'lishi kerak.\n' +
          'Masalan: 901234567',
          getRetryKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      const sotuvchi = await getSotuvchiByTelegramId(userId);
      if (!sotuvchi) {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '❌ Xatolik yuz berdi. Qayta ro\'yxatdan o\'ting.',
          getCancelKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        clearUserState(userId);
        return;
      }

      try {
        // Extract last 9 digits from input (942330690)
        const last9Digits = phoneInput.replace(/\D/g, '');
        
        // Search: match if phone ends with the 9 digits (942330690)
        // This will match: 998942330690, +998942330690, 998942330690, etc.
        // Find ALL transactions for this phone number that are NOT linked to any sotuvchi
        const unlinkedTransactions = await PaymentTransaction.find({
          mijozTelefonRaqami: { $regex: `${last9Digits}$` },
          $or: [
            { sotuvchiId: { $exists: false } },
            { sotuvchiId: null }
          ]
        }).sort({ vaqt: -1 }); // Sort by date, newest first
        
        if (unlinkedTransactions.length === 0) {
          // Check if there are any transactions at all for this phone
          const allTransactions = await PaymentTransaction.find({
            mijozTelefonRaqami: { $regex: `${last9Digits}$` }
          });
          
          if (allTransactions.length === 0) {
            const messageId = lastMessageIds.get(userId);
            const newMessageId = await sendOrEditMessage(
              chatId,
              `❌ Bu telefon raqam bo'yicha tranzaksiya topilmadi.\n\n` +
              `Qidirilgan raqam: ${phoneInput}`,
              getBuyurtmalarMenuKeyboard(),
              messageId
            );
            lastMessageIds.set(userId, newMessageId);
            setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
            return;
          } else {
            // All transactions are already linked
            const messageId = lastMessageIds.get(userId);
            const newMessageId = await sendOrEditMessage(
              chatId,
              `ℹ️ Bu telefon raqam bo'yicha barcha tranzaksiyalar allaqachon biriktirilgan.\n\n` +
              `Qidirilgan raqam: ${phoneInput}`,
              getBuyurtmalarMenuKeyboard(),
              messageId
            );
            lastMessageIds.set(userId, newMessageId);
            setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
            return;
          }
        }

        // If only one unlinked transaction, proceed with confirmation directly
        if (unlinkedTransactions.length === 1) {
          const transaction = unlinkedTransactions[0];
          
          // Store transaction ID for confirmation
          updateUserData(userId, { pendingTransactionId: transaction._id });
          setUserState(userId, States.CONFIRMING_BUYURTMA);

          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            formatTransactionDetails(transaction) + '\n\n' +
            '✅ Bu tranzaksiyani o\'zingizga biriktirishni tasdiqlaysizmi?',
            getConfirmCancelKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        // Multiple unlinked transactions - show selection with inline keyboard
        let message = `📋 Bu telefon raqam bo'yicha ${unlinkedTransactions.length} ta tasdiqlanmagan tranzaksiya topildi:\n\n`;
        
        unlinkedTransactions.forEach((transaction, index) => {
          const vaqt = new Date(transaction.vaqt);
          const formattedDate = vaqt.toLocaleString('uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          
          message += `${index + 1}. Operatsiya: ${transaction.operatsiyaRaqami}\n`;
          message += `   👤 ${transaction.mijozIsmi}\n`;
          message += `   💰 ${transaction.summa} UZS\n`;
          message += `   🕐 ${formattedDate}\n\n`;
        });
        
        message += `Quyidagilardan birini tanlang:`;

        // Create inline keyboard with transaction options
        const inlineKeyboard = {
          inline_keyboard: unlinkedTransactions.map((transaction, index) => [
            {
              text: `${index + 1}. Operatsiya: ${transaction.operatsiyaRaqami} (${transaction.summa} UZS)`,
              callback_data: `select_transaction_${transaction._id}`
            }
          ]).concat([
            [{ text: '❌ Bekor qilish', callback_data: 'cancel_transaction_selection' }]
          ])
        };

        // Store all transaction IDs for reference
        updateUserData(userId, { 
          pendingTransactions: unlinkedTransactions.map(t => t._id.toString()),
          searchPhone: phoneInput
        });
        setUserState(userId, States.SELECTING_TRANSACTION);

        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          message,
          { reply_markup: inlineKeyboard },
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
      } catch (error) {
        console.error('Error searching transaction:', error);
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.',
          getBuyurtmalarMenuKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
      }
      return;
    }

    // Handle confirmation
    if (state.state === States.CONFIRMING_BUYURTMA) {
      if (text === '✅ Tasdiqlash') {
        const sotuvchi = await getSotuvchiByTelegramId(userId);
        if (!sotuvchi) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '❌ Xatolik yuz berdi. Qayta ro\'yxatdan o\'ting.',
            getCancelKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          clearUserState(userId);
          return;
        }

        try {
          const transactionId = state.data.pendingTransactionId;
          const transaction = await PaymentTransaction.findById(transactionId);

          if (!transaction) {
            const messageId = lastMessageIds.get(userId);
            const newMessageId = await sendOrEditMessage(
              chatId,
              '❌ Tranzaksiya topilmadi.',
              getBuyurtmalarMenuKeyboard(),
              messageId
            );
            lastMessageIds.set(userId, newMessageId);
            setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
            return;
          }

          // Check if transaction is already linked to another sotuvchi
          if (transaction.sotuvchiId && transaction.sotuvchiId.toString() !== sotuvchi._id.toString()) {
            const otherSotuvchi = await Sotuvchi.findById(transaction.sotuvchiId);
            const otherSotuvchiName = otherSotuvchi 
              ? `${otherSotuvchi.ism} ${otherSotuvchi.familiya} (${otherSotuvchi.tartibRaqami})`
              : 'Boshqa sotuvchi';
            
            const messageId = lastMessageIds.get(userId);
            const newMessageId = await sendOrEditMessage(
              chatId,
              `❌ Bu tranzaksiya allaqachon boshqa sotuvchiga biriktirilgan.\n\n` +
              `👤 Biriktirilgan sotuvchi: ${otherSotuvchiName}\n\n` +
              `ℹ️ Har bir tranzaksiya faqat bitta sotuvchiga biriktirilishi mumkin.`,
              getBuyurtmalarMenuKeyboard(),
              messageId
            );
            lastMessageIds.set(userId, newMessageId);
            setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
            return;
          }

          // Check if already linked to this sotuvchi
          if (transaction.sotuvchiId && transaction.sotuvchiId.toString() === sotuvchi._id.toString()) {
            const messageId = lastMessageIds.get(userId);
            const newMessageId = await sendOrEditMessage(
              chatId,
              `ℹ️ Bu tranzaksiya allaqachon sizga biriktirilgan.\n\n` +
              formatTransactionDetails(transaction),
              getBuyurtmalarMenuKeyboard(),
              messageId
            );
            lastMessageIds.set(userId, newMessageId);
            setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
            return;
          }

          // Link transaction to sotuvchi
          transaction.sotuvchiId = sotuvchi._id;
          await transaction.save();

          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            `✅ Buyurtma muvaffaqiyatli biriktirildi!\n\n` +
            formatTransactionDetails(transaction),
            getBuyurtmalarMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);

          setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
        } catch (error) {
          console.error('Error linking transaction:', error);
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.',
            getBuyurtmalarMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
        }
        return;
      }

      if (text === '❌ Bekor qilish') {
        const sotuvchi = await getSotuvchiByTelegramId(userId);
        if (sotuvchi) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '❌ Buyurtma biriktirish bekor qilindi.',
            getBuyurtmalarMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
        }
        return;
      }
    }

    // Handle diller selection
    if (state.state === States.SELECTING_DILLER) {
      const sotuvchi = await getSotuvchiByTelegramId(userId);
      if (!sotuvchi) {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '❌ Xatolik yuz berdi.',
          getBackToMainMenuKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        setUserState(userId, States.REGISTERED, { sotuvchiId: null });
        return;
      }

      await sotuvchi.populate('dillerlar');
      const dillerlar = sotuvchi.dillerlar || [];

      // Find selected diller by matching text
      const selectedDiller = dillerlar.find(diller => {
        const buttonText = `📋 ${diller.ism} ${diller.familiya} (${diller.tartibRaqami})`;
        return text === buttonText || text.includes(diller.tartibRaqami);
      });

      if (!selectedDiller) {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '❌ Noto\'g\'ri diller tanlandi. Qayta tanlang:',
          getDillerSelectionKeyboard(dillerlar),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      // Check if this is for statistika or buyurtmalar
      if (state.data.forStatistika) {
        updateUserData(userId, { selectedDillerId: selectedDiller._id });
        setUserState(userId, States.REGISTERED, { 
          sotuvchiId: sotuvchi._id,
          selectedDillerId: selectedDiller._id 
        });
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '📊 Statistika davrini tanlang:',
          getStatistikaPeriodKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
      } else if (state.data.forBuyurtmalar) {
        // For buyurtmalar - save selected diller and show menu
        updateUserData(userId, { selectedDillerId: selectedDiller._id });
        setUserState(userId, States.REGISTERED, { 
          sotuvchiId: sotuvchi._id,
          selectedDillerId: selectedDiller._id 
        });
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          `✅ "${selectedDiller.ism} ${selectedDiller.familiya}" dilleri tanlandi.\n\n📦 Buyurtmalar bo'limi:`,
          getBuyurtmalarMenuKeyboard(dillerlar.length > 1),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
      } else {
        await showBuyurtmalarForDiller(chatId, userId, sotuvchi._id, selectedDiller._id, dillerlar.length > 1);
        setUserState(userId, States.REGISTERED, { 
          sotuvchiId: sotuvchi._id,
          selectedDillerId: selectedDiller._id 
        });
      }
      return;
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
  });
}

// Handle callback queries (inline button clicks)
if (bot) {
  bot.on('callback_query', async (query) => {
    try {
      const chatId = query.message.chat.id;
      const userId = query.from.id;
      const data = query.data;
      const state = getUserState(userId);

      // Handle transaction selection
      if (data.startsWith('select_transaction_')) {
        const transactionId = data.replace('select_transaction_', '');
        
        // Verify this transaction is in the pending list
        const currentState = getUserState(userId);
        if (currentState.state !== States.SELECTING_TRANSACTION) {
          await bot.answerCallbackQuery(query.id, {
            text: '❌ Amal muddati o\'tgan. Qayta urinib ko\'ring.',
            show_alert: true
          });
          return;
        }

        const pendingTransactions = currentState.data.pendingTransactions || [];
        if (!pendingTransactions.includes(transactionId)) {
          await bot.answerCallbackQuery(query.id, {
            text: '❌ Noto\'g\'ri tranzaksiya tanlandi.',
            show_alert: true
          });
          return;
        }

        // Get transaction
        const transaction = await PaymentTransaction.findById(transactionId);
        if (!transaction) {
          await bot.answerCallbackQuery(query.id, {
            text: '❌ Tranzaksiya topilmadi.',
            show_alert: true
          });
          return;
        }

        // Check if transaction is still unlinked
        if (transaction.sotuvchiId) {
          await bot.answerCallbackQuery(query.id, {
            text: '❌ Bu tranzaksiya allaqachon biriktirilgan.',
            show_alert: true
          });
          return;
        }

        // Store transaction ID for confirmation
        updateUserData(userId, { pendingTransactionId: transaction._id });
        setUserState(userId, States.CONFIRMING_BUYURTMA);

        // Edit message to show transaction details
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          formatTransactionDetails(transaction) + '\n\n' +
          '✅ Bu tranzaksiyani o\'zingizga biriktirishni tasdiqlaysizmi?',
          getConfirmCancelKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);

        await bot.answerCallbackQuery(query.id);
        return;
      }

      // Handle cancel transaction selection
      if (data === 'cancel_transaction_selection') {
        const sotuvchi = await getSotuvchiByTelegramId(userId);
        if (sotuvchi) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '❌ Tranzaksiya tanlash bekor qilindi.',
            getBuyurtmalarMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          setUserState(userId, States.REGISTERED, { sotuvchiId: sotuvchi._id });
        }
        await bot.answerCallbackQuery(query.id);
        return;
      }

      // Unknown callback
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Noma\'lum amal.',
        show_alert: true
      });
    } catch (error) {
      console.error('Error handling callback query:', error);
      try {
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Xatolik yuz berdi.',
          show_alert: true
        });
      } catch (e) {
        // Ignore if query already answered
      }
    }
  });
}

// Helper function to show statistika for a specific diller and sotuvchi
async function showStatistikaForDiller(chatId, userId, sotuvchiId, dillerId, sotuvchiTartibRaqami, period = 'all') {
  try {
    // Get diller info
    const diller = await Diller.findById(dillerId);
    if (!diller) {
      const messageId = lastMessageIds.get(userId);
      const newMessageId = await sendOrEditMessage(
        chatId,
        '❌ Diller topilmadi.',
        getBackToMainMenuKeyboard(),
        messageId
      );
      lastMessageIds.set(userId, newMessageId);
      return;
    }
    
    // Find all Sotuvchilar that have this Diller in their dillerlar array
    // This is more reliable than using diller.sotuvchilar
    const dillerSotuvchilar = await Sotuvchi.find({
      dillerlar: dillerId
    }).select('_id');
    
    const dillerSotuvchilarIds = dillerSotuvchilar.map(s => s._id);
    
    // Build query with date filter if period is specified
    const query = {
      sotuvchiId: { $in: dillerSotuvchilarIds },
    };
    
    if (period !== 'all') {
      const dateRange = getDateRange(period);
      if (dateRange.start && dateRange.end) {
        query.vaqt = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }
    }
    
    // Get buyurtmalar filtered by all Sotuvchilar that belong to the selected Diller
    // This shows statistics for all people served by this dealer
    const buyurtmalar = await PaymentTransaction.find(query);
    
    const buyurtmalarCount = buyurtmalar.length;
    
    // Calculate totals
    let umumiySumma = 0;
    let umumiyHisobgaOtkazilgan = 0;
    
    buyurtmalar.forEach((buyurtma) => {
      umumiySumma += parseSumma(buyurtma.summa);
      umumiyHisobgaOtkazilgan += parseSumma(buyurtma.hisobgaOtkazilganSumma);
    });
    
    // Format period name
    let periodName = '';
    switch (period) {
      case 'today':
        periodName = 'Bugungi';
        break;
      case 'yesterday':
        periodName = 'Kechagi';
        break;
      case 'week':
        periodName = 'Haftalik';
        break;
      case 'month':
        periodName = 'Oylik';
        break;
      default:
        periodName = 'Umumiy';
    }
    
    const messageId = lastMessageIds.get(userId);
    const newMessageId = await sendOrEditMessage(
      chatId,
      `📊 Statistika (${diller.ism} ${diller.familiya}) - ${periodName}:\n\n` +
      `🆔 Tartib raqami: ${sotuvchiTartibRaqami}\n` +
      `📦 Buyurtmalar: ${buyurtmalarCount}\n` +
      `💰 Umumiy summa: ${formatSumma(umumiySumma)}\n` +
      `💵 Hisobga o'tkazilgan: ${formatSumma(umumiyHisobgaOtkazilgan)}`,
      getStatistikaPeriodKeyboard(),
      messageId
    );
    lastMessageIds.set(userId, newMessageId);
  } catch (error) {
    console.error('Error showing statistika for diller:', error);
    const messageId = lastMessageIds.get(userId);
    const newMessageId = await sendOrEditMessage(
      chatId,
      '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.',
      getBackToMainMenuKeyboard(),
      messageId
    );
    lastMessageIds.set(userId, newMessageId);
  }
}

// Handle errors
if (bot) {
  bot.on('error', (error) => {
    console.error('Sotuvchi bot error:', error);
    // Don't crash - just log
  });

  bot.on('polling_error', (error) => {
    console.error('Sotuvchi bot polling error:', error);
    // Don't crash - just log
  });

  // Graceful shutdown
  const stopBot = () => {
    try {
      if (bot && bot.stopPolling) {
        console.log('Stopping Sotuvchi bot...');
        bot.stopPolling();
      }
    } catch (error) {
      console.error('Error stopping Sotuvchi bot:', error.message);
    }
  };

  process.on('SIGINT', stopBot);
  process.on('SIGTERM', stopBot);
}

module.exports = bot;
