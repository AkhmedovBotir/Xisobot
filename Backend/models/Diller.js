const mongoose = require('mongoose');

const dillerSchema = new mongoose.Schema(
  {
    ism: {
      type: String,
      required: [true, 'Ism majburiy'],
      trim: true,
    },
    familiya: {
      type: String,
      required: [true, 'Familiya majburiy'],
      trim: true,
    },
    telefonRaqam: {
      type: String,
      required: [true, 'Telefon raqam majburiy'],
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Telefon raqam formati noto\'g\'ri'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
    tartibRaqami: {
      type: String,
      unique: true,
      // Not required - will be set automatically before save (D1, D2, D3...)
    },
    telegramChatId: {
      type: Number,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
    },
    telegramUserId: {
      type: Number,
      unique: true,
      sparse: true,
    },
    sotuvchilar: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sotuvchi',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-increment tartib raqami before saving (D1, D2, D3...)
dillerSchema.pre('save', async function (next) {
  // Only set tartibRaqami for new documents that don't have it
  if (!this.isNew || this.tartibRaqami) {
    return next();
  }

  try {
    const Diller = this.constructor;
    // Find the highest tartib raqami (extract number from D1, D2, etc.)
    const lastDiller = await Diller.findOne().sort({ tartibRaqami: -1 }).lean();
    
    if (lastDiller && lastDiller.tartibRaqami) {
      // Extract number from format D1, D2, etc.
      const match = lastDiller.tartibRaqami.match(/D(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1]);
        this.tartibRaqami = `D${lastNumber + 1}`;
      } else {
        // If format is wrong, start from D1
        this.tartibRaqami = 'D1';
      }
      console.log(`Auto-assigned tartibRaqami: ${this.tartibRaqami}`);
    } else {
      // If no dealers exist, start from D1
      this.tartibRaqami = 'D1';
      console.log(`Auto-assigned tartibRaqami: D1 (first diller)`);
    }
    
    next();
  } catch (error) {
    console.error('Diller Pre-save Error (tartibRaqami):', error);
    next(error);
  }
});

module.exports = mongoose.model('Diller', dillerSchema);
