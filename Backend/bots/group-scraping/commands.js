const PaymentTransaction = require('../../models/PaymentTransaction');

// Bot will be passed from bot.js to avoid circular dependency
let botInstance = null;
let processOldMessagesFn = null;

function initializeCommands(bot, processOldMessages) {
  botInstance = bot;
  processOldMessagesFn = processOldMessages;
  
  setupCommands();
}

function setupCommands() {
  /**
   * Handle /start command - Only respond in private chats
   */
  botInstance.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;

    // Only respond in private chats, not in groups
    if (chatType === 'private') {
      botInstance.sendMessage(
        chatId,
        '👋 Salom! Men to\'lov tranzaksiyalarini avtomatik yig\'uvchi botman.\n\n' +
        'Men guruhlardan to\'lov xabarlarini o\'qib, bazaga saqlayman.\n\n' +
        'Bot guruhga qo\'shilganidan keyin, barcha to\'lov xabarlari avtomatik saqlanadi.\n\n' +
        'Bot guruhda hech qanday javob bermaydi - faqat ma\'lumotlarni yig\'adi.'
      );
    }
    // Do not respond in groups
  });

  /**
   * Handle /stats command - Get statistics (only in private chats)
   */
  botInstance.onText(/\/stats/, async (msg) => {
    try {
      const chatId = msg.chat.id;
      const chatType = msg.chat.type;

      // Only respond in private chats, not in groups
      if (chatType === 'private') {
        const totalTransactions = await PaymentTransaction.countDocuments();
        
        // Get recent transactions count (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        const recentTransactions = await PaymentTransaction.countDocuments({
          createdAt: { $gte: oneDayAgo },
        });

        botInstance.sendMessage(
          chatId,
          `📊 Statistika:\n\n` +
          `Jami tranzaksiyalar: ${totalTransactions}\n` +
          `So'nggi 24 soatda: ${recentTransactions}`
        );
      }
    } catch (error) {
      console.error('Error getting stats:', error);
    }
  });

  /**
   * Handle /process_old command - Process old messages (only in private chats)
   */
  botInstance.onText(/\/process_old/, async (msg) => {
    try {
      const chatId = msg.chat.id;
      const chatType = msg.chat.type;

      // Only respond in private chats
      if (chatType === 'private') {
        botInstance.sendMessage(
          chatId,
          '⏳ Eski xabarlarni qayta ishlash...\n\n' +
          'Eslatma: Bot faqat guruhga qo\'shilgandan keyin yuborilgan xabarlarni ko\'radi.\n' +
          'Bot guruhga qo\'shilganda avtomatik barcha xabarlarni qayta ishlaydi.'
        );

        // Note: This command is mainly for private chat info
        // Actual processing happens automatically when bot is added to group
      }
    } catch (error) {
      console.error('Error processing old messages:', error);
    }
  });

  /**
   * Handle /get_chat_id command - Get current chat ID (works in both private and groups)
   */
  botInstance.onText(/\/get_chat_id/, (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const chatTitle = msg.chat.title || 'Shaxsiy chat';
    
    // Respond in both private chats and groups
    botInstance.sendMessage(
      chatId,
      `📋 Chat ma'lumotlari:\n\n` +
      `Chat nomi: ${chatTitle}\n` +
      `Chat ID: \`${chatId}\`\n` +
      `Chat turi: ${chatType}\n\n` +
      `Bu ID ni .env faylida ALLOWED_CHAT_IDS ga qo'shing:\n` +
      `ALLOWED_CHAT_IDS=${chatId}`
    );
  });

  /**
   * Handle /help command (only in private chats)
   */
  botInstance.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    
    // Only respond in private chats
    if (chatType === 'private') {
      botInstance.sendMessage(
        chatId,
        '📖 Bot buyruqlari:\n\n' +
        '/start - Botni ishga tushirish\n' +
        '/get_chat_id - Joriy chat ID ni olish\n' +
        '/stats - Tranzaksiyalar statistikasi\n' +
        '/help - Yordam\n\n' +
        'Bot avtomatik ravishda to\'lov xabarlarini kuzatadi va saqlaydi.\n\n' +
        'Bot guruhga qo\'shilganda avtomatik barcha mavjud xabarlarni qayta ishlaydi.\n\n' +
        'Bot guruhda hech qanday javob bermaydi - faqat ma\'lumotlarni yig\'adi.'
      );
    }
    // Do not respond in groups
  });
}

module.exports = { initializeCommands };
