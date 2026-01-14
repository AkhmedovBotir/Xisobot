const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema(
  {
    operatsiyaRaqami: {
      type: String,
      required: true,
      trim: true,
    },
    tranzaksiyaId: {
      type: String,
      required: true,
      trim: true,
    },
    terminalId: {
      type: String,
      required: true,
      trim: true,
    },
    merchantId: {
      type: String,
      required: true,
      trim: true,
    },
    vaqt: {
      type: Date,
      required: true,
    },
    mijozTelefonRaqami: {
      type: String,
      required: true,
      trim: true,
    },
    mijozIsmi: {
      type: String,
      required: true,
      trim: true,
    },
    muddat: {
      type: String,
      required: true,
      trim: true,
    },
    summa: {
      type: String,
      required: true,
      trim: true,
    },
    hisobgaOtkazilganSumma: {
      type: String,
      required: true,
      trim: true,
    },
    dokonManzili: {
      type: String,
      trim: true,
    },
    originalMessage: {
      type: String,
      required: true,
    },
    telegramMessageId: {
      type: Number,
      required: true,
    },
    telegramChatId: {
      type: Number,
      required: true,
    },
    sotuvchiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sotuvchi',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
paymentTransactionSchema.index({ operatsiyaRaqami: 1 });
paymentTransactionSchema.index({ tranzaksiyaId: 1 });
paymentTransactionSchema.index({ vaqt: -1 });
// Unique index to prevent duplicate messages
paymentTransactionSchema.index({ telegramMessageId: 1, telegramChatId: 1 }, { unique: true });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
