/**
 * Check if message matches payment template
 * @param {string} messageText - Raw message text from Telegram
 * @returns {boolean} - True if message matches template
 */
function isPaymentMessage(messageText) {
  if (!messageText || typeof messageText !== 'string') {
    return false;
  }

  const requiredKeywords = [
    "To'lov muvaffaqiyatli o'tdi",
    'Operatsiya raqami',
    'Tranzaksiya IDsi',
    'Terminal ID',
    'Merchant ID',
    'Vaqt',
    'Mijozning telefon raqami',
    'Mijozning ismi',
    'Muddat',
    'Summa',
    'Hisobingizga o\'tkaziladi',
  ];

  const text = messageText.toLowerCase();
  const foundKeywords = requiredKeywords.filter((keyword) =>
    text.includes(keyword.toLowerCase())
  );

  // At least 9 out of 11 keywords should be present for better accuracy
  // This ensures the message really matches the payment template
  return foundKeywords.length >= 9;
}

/**
 * Parse payment message from Telegram group
 * @param {string} messageText - Raw message text from Telegram
 * @returns {Object|null} - Parsed payment data or null if parsing fails
 */
function parsePaymentMessage(messageText) {
  try {
    // First check if message matches template
    if (!isPaymentMessage(messageText)) {
      return null;
    }

    // Remove emojis and clean the text
    const cleanText = messageText.replace(/🕗/g, '').trim();

    // Extract data using regex patterns
    const patterns = {
      operatsiyaRaqami: /Operatsiya raqami:\s*(\d+)/i,
      tranzaksiyaId: /Tranzaksiya IDsi:\s*(\d+)/i,
      terminalId: /Terminal ID:\s*([A-Z0-9]+)/i,
      merchantId: /Merchant ID:\s*(\d+)/i,
      vaqt: /Vaqt:.*?(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})/i,
      mijozTelefonRaqami: /Mijozning telefon raqami:\s*(\d+)/i,
      mijozIsmi: /Mijozning ismi:\s*([A-Z\s\-]+?)(?=\n|$)/i,
      muddat: /Muddat:\s*([^\n]+)/i,
      summa: /Summa:\s*([\d,\.\s]+?)\s*UZS/i,
      hisobgaOtkazilganSumma: /Hisobingizga o'tkaziladi:\s*([\d,\.\s]+?)\s*UZS/i,
      dokonManzili: /Do'kon manzili:\s*([^\n]+?)(?=\n|Operatsiya|$)/i,
    };

    const parsed = {};

    // Extract each field
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = cleanText.match(pattern);
      if (match) {
        parsed[key] = match[1].trim();
      }
    }

    // Parse date string to Date object
    if (parsed.vaqt) {
      // Format: 14.01.2026 17:15
      const [datePart, timePart] = parsed.vaqt.split(' ');
      const [day, month, year] = datePart.split('.');
      const [hour, minute] = timePart.split(':');
      parsed.vaqt = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
    }

    // Validate required fields
    const requiredFields = [
      'operatsiyaRaqami',
      'tranzaksiyaId',
      'terminalId',
      'merchantId',
      'vaqt',
      'mijozTelefonRaqami',
      'mijozIsmi',
      'muddat',
      'summa',
      'hisobgaOtkazilganSumma',
    ];

    const missingFields = requiredFields.filter((field) => !parsed[field]);

    if (missingFields.length > 0) {
      return null;
    }

    // Add original message
    parsed.originalMessage = messageText;

    return parsed;
  } catch (error) {
    return null;
  }
}

module.exports = { parsePaymentMessage, isPaymentMessage };
