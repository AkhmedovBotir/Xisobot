const Diller = require('../models/Diller');

// @desc    Get all dillerlar
// @route   GET /api/diller
// @access  Private
exports.getAllDillerlar = async (req, res) => {
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

    let dillerlar = await Diller.find(query)
      .select('-__v');

    // Sort by tartibRaqami numerically (D1, D2, D3...)
    dillerlar.sort((a, b) => {
      const numA = parseInt(a.tartibRaqami?.match(/D(\d+)/)?.[1] || '0');
      const numB = parseInt(b.tartibRaqami?.match(/D(\d+)/)?.[1] || '0');
      return numA - numB;
    });

    res.status(200).json({
      success: true,
      count: dillerlar.length,
      data: dillerlar,
    });
  } catch (error) {
    console.error('GetAllDillerlar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Get single diller
// @route   GET /api/diller/:id
// @access  Private
exports.getDiller = async (req, res) => {
  try {
    const diller = await Diller.findById(req.params.id).select('-__v');

    if (!diller) {
      return res.status(404).json({
        success: false,
        message: 'Diller topilmadi',
      });
    }

    res.status(200).json({
      success: true,
      data: diller,
    });
  } catch (error) {
    console.error('GetDiller Error:', error);
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

// @desc    Create new diller
// @route   POST /api/diller
// @access  Private
exports.createDiller = async (req, res) => {
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
    const existingDiller = await Diller.findOne({ telefonRaqam });
    if (existingDiller) {
      return res.status(400).json({
        success: false,
        message: 'Bu telefon raqam allaqachon mavjud',
      });
    }

    const diller = await Diller.create({
      ism,
      familiya,
      telefonRaqam,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Diller muvaffaqiyatli yaratildi',
      data: diller,
    });
  } catch (error) {
    console.error('CreateDiller Error:', error);
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

// @desc    Update diller
// @route   PUT /api/diller/:id
// @access  Private
exports.updateDiller = async (req, res) => {
  try {
    const { ism, familiya, telefonRaqam, status } = req.body;

    let diller = await Diller.findById(req.params.id);

    if (!diller) {
      return res.status(404).json({
        success: false,
        message: 'Diller topilmadi',
      });
    }

    // Check if telefon raqam is being changed and if it already exists
    if (telefonRaqam && telefonRaqam !== diller.telefonRaqam) {
      const existingDiller = await Diller.findOne({ telefonRaqam });
      if (existingDiller) {
        return res.status(400).json({
          success: false,
          message: 'Bu telefon raqam allaqachon mavjud',
        });
      }
    }

    // Update fields
    if (ism) diller.ism = ism;
    if (familiya) diller.familiya = familiya;
    if (telefonRaqam) diller.telefonRaqam = telefonRaqam;
    if (status) diller.status = status;

    await diller.save();

    res.status(200).json({
      success: true,
      message: 'Diller muvaffaqiyatli yangilandi',
      data: diller,
    });
  } catch (error) {
    console.error('UpdateDiller Error:', error);
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

// @desc    Delete diller
// @route   DELETE /api/diller/:id
// @access  Private
exports.deleteDiller = async (req, res) => {
  try {
    const diller = await Diller.findById(req.params.id);

    if (!diller) {
      return res.status(404).json({
        success: false,
        message: 'Diller topilmadi',
      });
    }

    await diller.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Diller muvaffaqiyatli o\'chirildi',
      data: {},
    });
  } catch (error) {
    console.error('DeleteDiller Error:', error);
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
