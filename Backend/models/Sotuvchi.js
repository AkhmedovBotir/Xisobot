const mongoose = require('mongoose');

const sotuvchiSchema = new mongoose.Schema(
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
      // Not required - will be set automatically before save (S1, S2, S3...)
    },
    dillerlar: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diller',
      },
    ],
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
  },
  {
    timestamps: true,
  }
);

// Auto-increment tartib raqami before saving (S1, S2, S3...)
sotuvchiSchema.pre('save', async function (next) {
  // Only set tartibRaqami for new documents that don't have it
  if (!this.isNew || this.tartibRaqami) {
    return next();
  }

  try {
    const Sotuvchi = this.constructor;
    // Find the highest tartib raqami (extract number from S1, S2, etc.)
    const lastSotuvchi = await Sotuvchi.findOne().sort({ tartibRaqami: -1 }).lean();
    
    if (lastSotuvchi && lastSotuvchi.tartibRaqami) {
      // Extract number from format S1, S2, etc.
      const match = lastSotuvchi.tartibRaqami.match(/S(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1]);
        this.tartibRaqami = `S${lastNumber + 1}`;
      } else {
        // If format is wrong, start from S1
        this.tartibRaqami = 'S1';
      }
      console.log(`Auto-assigned tartibRaqami: ${this.tartibRaqami}`);
    } else {
      // If no sellers exist, start from S1
      this.tartibRaqami = 'S1';
      console.log(`Auto-assigned tartibRaqami: S1 (first sotuvchi)`);
    }
    
    next();
  } catch (error) {
    console.error('Sotuvchi Pre-save Error (tartibRaqami):', error);
    next(error);
  }
});

module.exports = mongoose.model('Sotuvchi', sotuvchiSchema);
