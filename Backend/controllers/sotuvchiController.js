const Sotuvchi = require('../models/Sotuvchi');

// @desc    Get all sotuvchilar
// @route   GET /api/sotuvchi
// @access  Private
exports.getAllSotuvchilar = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { ism: { $regex: search, $options: 'i' } },
        { familiya: { $regex: search, $options: 'i' } },
        { telefonRaqam: { $regex: search, $options: 'i' } },
      ];
    }

    let sotuvchilar = await Sotuvchi.find(query)
      .select('-__v');

    // Sort by tartibRaqami numerically (S1, S2, S3...)
    sotuvchilar.sort((a, b) => {
      const numA = parseInt(a.tartibRaqami?.match(/S(\d+)/)?.[1] || '0');
      const numB = parseInt(b.tartibRaqami?.match(/S(\d+)/)?.[1] || '0');
      return numA - numB;
    });

    res.status(200).json({
      success: true,
      count: sotuvchilar.length,
      data: sotuvchilar,
    });
  } catch (error) {
    console.error('GetAllSotuvchilar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Get single sotuvchi
// @route   GET /api/sotuvchi/:id
// @access  Private
exports.getSotuvchi = async (req, res) => {
  try {
    const sotuvchi = await Sotuvchi.findById(req.params.id).select('-__v');

    if (!sotuvchi) {
      return res.status(404).json({
        success: false,
        message: 'Sotuvchi topilmadi',
      });
    }

    res.status(200).json({
      success: true,
      data: sotuvchi,
    });
  } catch (error) {
    console.error('GetSotuvchi Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri ID formati',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Create new sotuvchi
// @route   POST /api/sotuvchi
// @access  Private
exports.createSotuvchi = async (req, res) => {
  try {
    const { ism, familiya, telefonRaqam, status } = req.body;

    // Validation
    if (!ism || !familiya || !telefonRaqam) {
      return res.status(400).json({
        success: false,
        message: 'Ism, familiya va telefon raqam majburiy',
      });
    }

    // Check if telefon raqam already exists
    const existingSotuvchi = await Sotuvchi.findOne({ telefonRaqam });
    if (existingSotuvchi) {
      return res.status(400).json({
        success: false,
        message: 'Bu telefon raqam allaqachon mavjud',
      });
    }

    // dillerId is optional for API (can be set via Telegram bot)
    const sotuvchi = await Sotuvchi.create({
      ism,
      familiya,
      telefonRaqam,
      status: status || 'active',
      dillerId: req.body.dillerId || null, // Optional for API
    });

    res.status(201).json({
      success: true,
      message: 'Sotuvchi muvaffaqiyatli yaratildi',
      data: sotuvchi,
    });
  } catch (error) {
    console.error('CreateSotuvchi Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu tartib raqami allaqachon mavjud',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Update sotuvchi
// @route   PUT /api/sotuvchi/:id
// @access  Private
exports.updateSotuvchi = async (req, res) => {
  try {
    const { ism, familiya, telefonRaqam, status } = req.body;

    let sotuvchi = await Sotuvchi.findById(req.params.id);

    if (!sotuvchi) {
      return res.status(404).json({
        success: false,
        message: 'Sotuvchi topilmadi',
      });
    }

    // Check if telefon raqam is being changed and if it already exists
    if (telefonRaqam && telefonRaqam !== sotuvchi.telefonRaqam) {
      const existingSotuvchi = await Sotuvchi.findOne({ telefonRaqam });
      if (existingSotuvchi) {
        return res.status(400).json({
          success: false,
          message: 'Bu telefon raqam allaqachon mavjud',
        });
      }
    }

    // Update fields
    if (ism) sotuvchi.ism = ism;
    if (familiya) sotuvchi.familiya = familiya;
    if (telefonRaqam) sotuvchi.telefonRaqam = telefonRaqam;
    if (status) sotuvchi.status = status;

    await sotuvchi.save();

    res.status(200).json({
      success: true,
      message: 'Sotuvchi muvaffaqiyatli yangilandi',
      data: sotuvchi,
    });
  } catch (error) {
    console.error('UpdateSotuvchi Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri ID formati',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Delete sotuvchi
// @route   DELETE /api/sotuvchi/:id
// @access  Private
exports.deleteSotuvchi = async (req, res) => {
  try {
    const sotuvchi = await Sotuvchi.findById(req.params.id);

    if (!sotuvchi) {
      return res.status(404).json({
        success: false,
        message: 'Sotuvchi topilmadi',
      });
    }

    await sotuvchi.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sotuvchi muvaffaqiyatli o\'chirildi',
      data: {},
    });
  } catch (error) {
    console.error('DeleteSotuvchi Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri ID formati',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};
