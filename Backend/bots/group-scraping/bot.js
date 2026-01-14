const TelegramBot = require('node-telegram-bot-api');
const { parsePaymentMessage, isPaymentMessage } = require('./parser');
const PaymentTransaction = require('../../models/PaymentTransaction');
require('dotenv').config();

// Initialize bot - errors won't crash other bots
const token = process.env.TELEGRAM_BOT_TOKEN || '8576963562:AAFRPXHSWn5HC4Sxxjynvi76odVvy9G9SHk';
let bot;

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
} catch (error) {
  console.error('❌ Failed to initialize group-scraping bot:', error.message);
  console.error('   Other bots will continue to work');
}

// Allowed chat IDs (optional - if empty, processes all groups)
// Format: comma-separated chat IDs, e.g., "-1001234567890,-1001234567891"
const ALLOWED_CHAT_IDS = process.env.ALLOWED_CHAT_IDS 
  ? process.env.ALLOWED_CHAT_IDS.split(',').map(id => id.trim())
  : [];

if (bot) {
  console.log('Telegram bot started...');
  if (ALLOWED_CHAT_IDS.length > 0) {
    console.log('Allowed chat IDs:', ALLOWED_CHAT_IDS);
  } else {
    console.log('Processing messages from all groups');
  }
}

// Statistics counter - thread-safe for concurrent message processing
// Node.js single-threaded event loop ensures atomic operations
let stats = {
  totalMessagesChecked: 0,
  paymentMessagesFound: 0,
  paymentMessagesSaved: 0,
  paymentMessagesSkipped: 0,
  errors: 0,
  lastUpdate: new Date(),
};

// Initialize bot info
let botInfo = null;
if (bot) {
  bot.getMe().then(info => {
    botInfo = info;
    bot.botInfo = info;
    console.log(`Bot username: @${info.username}`);
  }).catch(err => {
    console.error('Error getting bot info:', err);
  });
}

// Print statistics only when there's activity (not on fixed interval)
let lastStatsPrint = 0;

/**
 * Process and save payment message
 * @param {Object} msg - Telegram message object
 * @param {string} messageText - Message text
 */
async function processPaymentMessage(msg, messageText) {
  try {
    stats.paymentMessagesFound++;
    stats.lastUpdate = new Date();

    // Parse the message
    const parsedData = parsePaymentMessage(messageText);

    if (!parsedData) {
      stats.errors++;
      return false;
    }

    // Check if transaction already exists by telegramMessageId and telegramChatId
    const existingTransaction = await PaymentTransaction.findOne({
      telegramMessageId: msg.message_id,
      telegramChatId: msg.chat.id,
    });

    if (existingTransaction) {
      stats.paymentMessagesSkipped++;
      return false;
    }

    // Add Telegram metadata
    parsedData.telegramMessageId = msg.message_id;
    parsedData.telegramChatId = msg.chat.id;

    // Save to database
    const transaction = await PaymentTransaction.create(parsedData);

    stats.paymentMessagesSaved++;
    
    // Print statistics only when new message is saved
    const now = Date.now();
    if (now - lastStatsPrint > 5000) { // Print stats max once per 5 seconds
      console.log(`\n✅ [${new Date().toLocaleTimeString()}] Payment transaction saved!`);
      console.log(`   Operatsiya: ${transaction.operatsiyaRaqami} | Tranzaksiya: ${transaction.tranzaksiyaId}`);
      console.log(`   Summa: ${transaction.summa} | Mijoz: ${transaction.mijozIsmi}`);
      console.log(`   📊 Total saved: ${stats.paymentMessagesSaved} | Skipped: ${stats.paymentMessagesSkipped}\n`);
      lastStatsPrint = now;
    } else {
      console.log(`✅ [${new Date().toLocaleTimeString()}] Payment saved: ${transaction.operatsiyaRaqami} | Total: ${stats.paymentMessagesSaved}`);
    }

    return true;
  } catch (error) {
    stats.errors++;
    console.error(`❌ [${new Date().toLocaleTimeString()}] Error:`, error.message);
    return false;
  }
}

/**
 * Process all messages from a group when bot is added
 * Note: Telegram Bot API limitation - bot can only see messages sent after it was added
 * For older messages, they need to be forwarded or resent to the group
 * @param {number} chatId - Telegram chat ID
 */
async function processAllGroupMessages(chatId) {
  // Note: We can't use getUpdates while polling is active
  // Old messages will be processed when they are forwarded or resent
  console.log(`\nℹ️  Bot is monitoring chat ${chatId} for new messages`);
  console.log('   Old messages will be processed when forwarded or resent to the group');
  return {
    processed: 0,
    skipped: 0,
    totalChecked: 0,
  };
}

// Alias for backward compatibility
const processOldMessages = processAllGroupMessages;

// Initialize commands after all functions are defined
if (bot) {
  const { initializeCommands } = require('./commands');
  initializeCommands(bot, processOldMessages);
}

// Handle bot being added to a group
if (bot) {
  bot.on('new_chat_members', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const newMembers = msg.new_chat_members || [];

    // Get bot info if not available
    if (!botInfo) {
      botInfo = await bot.getMe();
      bot.botInfo = botInfo;
    }

    // Check if bot was added to the group
    const botWasAdded = newMembers.some(member => {
      return member.id === botInfo.id || (member.is_bot && member.username === botInfo.username);
    });

    if (botWasAdded && (chatType === 'group' || chatType === 'supergroup')) {
      const chatTitle = msg.chat.title || 'Unknown';
      console.log(`\n🤖 Bot added to group: ${chatTitle} (ID: ${chatId})`);
      console.log('   Bot will process new payment messages from this group\n');
    }
  } catch (error) {
    // Silent error handling
  }
  });
}

// When bot starts, log startup info
if (bot) {
  setTimeout(async () => {
  try {
    if (!botInfo) {
      botInfo = await bot.getMe();
      bot.botInfo = botInfo;
    }

    if (ALLOWED_CHAT_IDS.length > 0) {
      console.log(`\n✅ Bot is monitoring ${ALLOWED_CHAT_IDS.length} group(s): ${ALLOWED_CHAT_IDS.join(', ')}`);
    } else {
      console.log('\n✅ Bot is monitoring all groups');
    }
    console.log('   Bot will process payment messages as they come in\n');
  } catch (error) {
    console.error('❌ Error during startup:', error.message);
  }
  }, 2000); // Wait 2 seconds after bot starts
}

// Handle all new messages (including forwarded messages)
if (bot) {
  bot.on('message', async (msg) => {
  try {
    // Only process messages from groups/channels
    const chatType = msg.chat.type;
    
    if (chatType !== 'group' && chatType !== 'supergroup') {
      return; // Ignore private messages
    }

    const chatId = msg.chat.id;
    const chatTitle = msg.chat.title || 'Unknown';

    // If ALLOWED_CHAT_IDS is set, only process messages from allowed chats
    if (ALLOWED_CHAT_IDS.length > 0 && !ALLOWED_CHAT_IDS.includes(String(chatId))) {
      return; // Silently skip
    }

    stats.totalMessagesChecked++;
    stats.lastUpdate = new Date();

    const messageText = msg.text || msg.caption || '';

    if (!messageText) {
      return; // Skip empty messages
    }

    // Always check if message matches payment template
    if (isPaymentMessage(messageText)) {
      // Process payment message (works for both new and forwarded messages)
      await processPaymentMessage(msg, messageText);
    }
  } catch (error) {
    stats.errors++;
    console.error(`\n❌ [ERROR] Error processing message:`, error.message);
    console.error('   Stack:', error.stack);
  }
  });

  // Handle edited messages (in case someone edits a payment message)
  bot.on('edited_message', async (msg) => {
    try {
      const chatType = msg.chat?.type;
      
      if (chatType !== 'group' && chatType !== 'supergroup') {
        return;
      }

      const chatId = msg.chat.id;

      // If ALLOWED_CHAT_IDS is set, only process messages from allowed chats
      if (ALLOWED_CHAT_IDS.length > 0 && !ALLOWED_CHAT_IDS.includes(String(chatId))) {
        return;
      }

      const messageText = msg.text || msg.caption || '';

      if (!messageText) {
        return;
      }
      
      // Process edited payment message
      await processPaymentMessage(msg, messageText);
    } catch (error) {
      // Silent error handling
    }
  });
}


// Handle errors
if (bot) {
  bot.on('error', (error) => {
    console.error('Group-scraping bot error:', error);
    // Don't crash - just log
  });

  bot.on('polling_error', (error) => {
    console.error('Group-scraping bot polling error:', error);
    // Don't crash - just log
  });

  // Graceful shutdown
  const stopBot = () => {
    try {
      if (bot && bot.stopPolling) {
        console.log('Stopping Group-scraping bot...');
        bot.stopPolling();
      }
    } catch (error) {
      console.error('Error stopping Group-scraping bot:', error.message);
    }
  };

  process.on('SIGINT', stopBot);
  process.on('SIGTERM', stopBot);
}

// Export bot and utility functions
if (bot) {
  module.exports = bot;
  module.exports.processOldMessages = processOldMessages;
  module.exports.processPaymentMessage = processPaymentMessage;
} else {
  module.exports = {};
}
