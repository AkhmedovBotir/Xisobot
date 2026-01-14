const TelegramBot = require('node-telegram-bot-api');
const Diller = require('../../models/Diller');
const Sotuvchi = require('../../models/Sotuvchi');
const PaymentTransaction = require('../../models/PaymentTransaction');
const { States, getUserState, setUserState, clearUserState, updateUserData } = require('./stateManager');
const {
  getPhoneKeyboard,
  getMainMenuKeyboard,
  getSotuvchilarMenuKeyboard,
  getBackToMainMenuKeyboard,
  getCancelKeyboard,
  getRetryKeyboard,
  getStatistikaPeriodKeyboard,
} = require('./keyboards');
require('dotenv').config();

// Initialize bot - errors won't crash other bots
const token = process.env.DILLER_BOT_TOKEN;
let bot;

if (!token) {
  console.error('❌ DILLER_BOT_TOKEN not found in .env file');
  console.error('   Diller bot will not start, but other bots will continue');
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
    console.log('Diller Telegram bot started...');
  } catch (error) {
    console.error('❌ Failed to initialize Diller bot:', error.message);
    console.error('   Other bots will continue to work');
  }
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

// Helper function to format phone number
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with country code, keep it, otherwise add 998
  if (cleaned.startsWith('998')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('998')) {
    return '+' + cleaned;
  } else {
    // Assume it's local number, add 998
    return '+998' + cleaned;
  }
}

// Helper function to check if phone number matches Diller
async function checkPhoneNumber(phoneNumber) {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const diller = await Diller.findOne({ telefonRaqam: formattedPhone });
    return diller;
  } catch (error) {
    console.error('Error checking phone number:', error);
    return null;
  }
}

// Helper function to get registered Diller by Telegram ID
async function getDillerByTelegramId(telegramUserId) {
  try {
    const diller = await Diller.findOne({ telegramUserId });
    return diller;
  } catch (error) {
    console.error('Error getting diller by telegram ID:', error);
    return null;
  }
}

// Start command - Registration flow
if (bot) {
  bot.onText(/\/start/, async (msg) => {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id;

      // Check if user is already registered
      const existingDiller = await getDillerByTelegramId(userId);
      
      if (existingDiller) {
        // User is registered, show main menu
        await bot.sendMessage(
          chatId,
          `👋 Salom, ${existingDiller.ism} ${existingDiller.familiya}!\n\n` +
          `Siz allaqachon ro'yxatdan o'tgansiz.`,
          getMainMenuKeyboard()
        );
        setUserState(userId, States.REGISTERED, { dillerId: existingDiller._id });
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
      await bot.sendMessage(
        chatId,
        '❌ Amal bekor qilindi.',
        { reply_markup: { remove_keyboard: true } }
      );
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
      } else if (currentState.state === States.ADDING_SOTUVCHI_CODE) {
        await bot.sendMessage(chatId, '📝 Sotuvchi kodini (tartib raqamini) kiriting:\nMasalan: S1, S2, S3...', getRetryKeyboard());
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

      // Check if phone number exists in Diller database
      const diller = await checkPhoneNumber(phoneNumber);
      
      if (!diller) {
        await bot.sendMessage(
          chatId,
          '❌ Bu telefon raqam bazada topilmadi. Iltimos, admin bilan bog\'laning.',
          { reply_markup: { remove_keyboard: true } }
        );
        clearUserState(userId);
        return;
      }

      // Check if this Diller is already registered with another Telegram account
      if (diller.telegramUserId && diller.telegramUserId !== userId) {
        await bot.sendMessage(
          chatId,
          '❌ Bu telefon raqam boshqa Telegram akkaunt bilan bog\'langan.',
          { reply_markup: { remove_keyboard: true } }
        );
        clearUserState(userId);
        return;
      }

      // Update Diller with Telegram info
      const formattedPhone = formatPhoneNumber(phoneNumber);
      diller.telegramChatId = chatId;
      diller.telegramUserId = userId;
      await diller.save();

      setUserState(userId, States.REGISTERED, { dillerId: diller._id });
      
      const sent = await bot.sendMessage(
        chatId,
        `✅ Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!\n\n` +
        `👤 Ism: ${diller.ism}\n` +
        `👤 Familiya: ${diller.familiya}\n` +
        `📱 Telefon: ${diller.telefonRaqam}\n` +
        `🆔 Tartib raqami: ${diller.tartibRaqami}\n\n` +
        `Asosiy menyu:`,
        getMainMenuKeyboard()
      );
      lastMessageIds.set(userId, sent.message_id);
      return;
    }

    // Store last message ID for editing - thread-safe for concurrent users
// Each user has isolated message ID storage
const lastMessageIds = new Map();

// Helper function to send or edit message
async function sendOrEditMessage(chatId, text, keyboard, messageId = null) {
  try {
    if (messageId) {
      // Edit existing message
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard.reply_markup,
      });
      return messageId;
    } else {
      // Send new message
      const sent = await bot.sendMessage(chatId, text, keyboard);
      return sent.message_id;
    }
  } catch (error) {
    // If edit fails (message not found), send new message
    if (error.response && error.response.statusCode === 400) {
      const sent = await bot.sendMessage(chatId, text, keyboard);
      return sent.message_id;
    }
    throw error;
  }
}

// Handle main menu options
    if (state.state === States.REGISTERED) {
      if (text === '👥 Sotuvchilar') {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '👥 Sotuvchilar bo\'limi:',
          getSotuvchilarMenuKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      if (text === '📋 Mening sotuvchilarim') {
        const diller = await getDillerByTelegramId(userId);
        if (!diller) {
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

        // Get sotuvchilar from many-to-many relationship
        await diller.populate('sotuvchilar');
        const sotuvchilar = diller.sotuvchilar || [];

        if (sotuvchilar.length === 0) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '📋 Hozircha sotuvchilar mavjud emas.\n\n' +
            'Sotuvchi qo\'shish uchun "➕ Sotuvchi qo\'shish" tugmasini bosing.',
            getSotuvchilarMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        let message = '📋 Mening sotuvchilarim:\n\n';
        sotuvchilar.forEach((sotuvchi, index) => {
          message += `${index + 1}. ${sotuvchi.ism} ${sotuvchi.familiya}\n`;
          message += `   📱 ${sotuvchi.telefonRaqam}\n`;
          message += `   🆔 ${sotuvchi.tartibRaqami}\n`;
          message += `   📊 Status: ${sotuvchi.status === 'active' ? '✅ Faol' : '❌ Nofaol'}\n\n`;
        });

        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          message,
          getSotuvchilarMenuKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      if (text === '➕ Sotuvchi qo\'shish') {
        setUserState(userId, States.ADDING_SOTUVCHI_CODE);
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '➕ Yangi sotuvchi qo\'shish:\n\n' +
          '📝 Sotuvchi kodini (tartib raqamini) kiriting:\n' +
          'Masalan: S1, S2, S3...',
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
        const diller = await getDillerByTelegramId(userId);
        if (diller) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            '📊 Statistika davrini tanlang:',
            getStatistikaPeriodKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
        }
        return;
      }

      // Handle statistika period selection
      if (text === '📊 Bugungi' || text === '📊 Kechagi' || text === '📊 Haftalik' || text === '📊 Oylik') {
        const diller = await getDillerByTelegramId(userId);
        if (!diller) {
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

        await diller.populate('sotuvchilar');
        const sotuvchilar = diller.sotuvchilar || [];
        const sotuvchilarCount = sotuvchilar.length;
        
        // Get all buyurtmalar from all linked sotuvchilar
        const sotuvchiIds = sotuvchilar.map(s => s._id);
        
        // Build query with date filter if period is specified
        let period = 'all';
        if (text === '📊 Bugungi') period = 'today';
        else if (text === '📊 Kechagi') period = 'yesterday';
        else if (text === '📊 Haftalik') period = 'week';
        else if (text === '📊 Oylik') period = 'month';
        
        const query = {
          sotuvchiId: { $in: sotuvchiIds }
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
          `📊 Statistika - ${periodName}:\n\n` +
          `🆔 Tartib raqami: ${diller.tartibRaqami}\n` +
          `👥 Sotuvchilar: ${sotuvchilarCount}\n` +
          `📦 Buyurtmalar: ${buyurtmalarCount}\n` +
          `💰 Umumiy summa: ${formatSumma(umumiySumma)}\n` +
          `💵 Hisobga o'tkazilgan: ${formatSumma(umumiyHisobgaOtkazilgan)}`,
          getStatistikaPeriodKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
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

    // Handle adding sotuvchi by code
    if (state.state === States.ADDING_SOTUVCHI_CODE) {
      if (!text || !text.trim()) {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '❌ Sotuvchi kodi kiritilmadi. Qayta kiriting:\n' +
          'Masalan: S1, S2, S3...',
          getRetryKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      const sotuvchiCode = text.trim().toUpperCase();
      
      // Validate format (S1, S2, etc.)
      if (!/^S\d+$/.test(sotuvchiCode)) {
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '❌ Noto\'g\'ri format. Sotuvchi kodi "S" harfi va raqamdan iborat bo\'lishi kerak.\n' +
          'Masalan: S1, S2, S3...',
          getRetryKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        return;
      }

      const diller = await getDillerByTelegramId(userId);
      if (!diller) {
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
        // Find sotuvchi by tartibRaqami
        const sotuvchi = await Sotuvchi.findOne({ tartibRaqami: sotuvchiCode });
        
        if (!sotuvchi) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            `❌ Sotuvchi "${sotuvchiCode}" topilmadi.\n\n` +
            'Iltimos, to\'g\'ri kodni kiriting.',
            getCancelKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          return;
        }

        // Check if already linked
        if (diller.sotuvchilar && diller.sotuvchilar.includes(sotuvchi._id)) {
          const messageId = lastMessageIds.get(userId);
          const newMessageId = await sendOrEditMessage(
            chatId,
            `ℹ️ Sotuvchi "${sotuvchiCode}" allaqachon sizga biriktirilgan.\n\n` +
            `👤 ${sotuvchi.ism} ${sotuvchi.familiya}`,
            getSotuvchilarMenuKeyboard(),
            messageId
          );
          lastMessageIds.set(userId, newMessageId);
          setUserState(userId, States.REGISTERED, { dillerId: diller._id });
          return;
        }

        // Add to many-to-many relationship
        if (!diller.sotuvchilar) {
          diller.sotuvchilar = [];
        }
        diller.sotuvchilar.push(sotuvchi._id);
        await diller.save();

        // Also add diller to sotuvchi's dillerlar array
        if (!sotuvchi.dillerlar) {
          sotuvchi.dillerlar = [];
        }
        if (!sotuvchi.dillerlar.includes(diller._id)) {
          sotuvchi.dillerlar.push(diller._id);
          await sotuvchi.save();
        }

        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          `✅ Sotuvchi muvaffaqiyatli qo'shildi!\n\n` +
          `👤 Ism: ${sotuvchi.ism}\n` +
          `👤 Familiya: ${sotuvchi.familiya}\n` +
          `📱 Telefon: ${sotuvchi.telefonRaqam}\n` +
          `🆔 Tartib raqami: ${sotuvchi.tartibRaqami}`,
          getSotuvchilarMenuKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);

        setUserState(userId, States.REGISTERED, { dillerId: diller._id });
      } catch (error) {
        console.error('Error adding sotuvchi:', error);
        const messageId = lastMessageIds.get(userId);
        const newMessageId = await sendOrEditMessage(
          chatId,
          '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.',
          getSotuvchilarMenuKeyboard(),
          messageId
        );
        lastMessageIds.set(userId, newMessageId);
        setUserState(userId, States.REGISTERED, { dillerId: diller._id });
      }
      return;
    }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
}

// Inline keyboard callbacks removed - using regular keyboard buttons instead

// Handle errors
if (bot) {
  bot.on('error', (error) => {
    console.error('Diller bot error:', error);
    // Don't crash - just log
  });

  bot.on('polling_error', (error) => {
    console.error('Diller bot polling error:', error);
    // Don't crash - just log
  });

  // Graceful shutdown
  const stopBot = () => {
    try {
      if (bot && bot.stopPolling) {
        console.log('Stopping Diller bot...');
        bot.stopPolling();
      }
    } catch (error) {
      console.error('Error stopping Diller bot:', error.message);
    }
  };

  process.on('SIGINT', stopBot);
  process.on('SIGTERM', stopBot);
}

module.exports = bot;
