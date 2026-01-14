const PaymentTransaction = require('../models/PaymentTransaction');

// @desc    Get all payment transactions
// @route   GET /api/payments
// @access  Private
exports.getAllPayments = async (req, res) => {
  try {
    const { 
      operatsiyaRaqami, 
      tranzaksiyaId, 
      terminalId, 
      merchantId,
      mijozTelefonRaqami,
      mijozIsmi,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    const query = {};

    if (operatsiyaRaqami) {
      query.operatsiyaRaqami = operatsiyaRaqami;
    }

    if (tranzaksiyaId) {
      query.tranzaksiyaId = tranzaksiyaId;
    }

    if (terminalId) {
      query.terminalId = terminalId;
    }

    if (merchantId) {
      query.merchantId = merchantId;
    }

    if (mijozTelefonRaqami) {
      query.mijozTelefonRaqami = { $regex: mijozTelefonRaqami, $options: 'i' };
    }

    if (mijozIsmi) {
      query.mijozIsmi = { $regex: mijozIsmi, $options: 'i' };
    }

    // Date range filter
    if (startDate || endDate) {
      query.vaqt = {};
      if (startDate) {
        query.vaqt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.vaqt.$lte = new Date(endDate);
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await PaymentTransaction.countDocuments(query);

    // Get transactions
    let transactions = await PaymentTransaction.find(query)
      .sort({ vaqt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-originalMessage -__v');

    // Add "yangi" flag (1 kungacha yangi)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    transactions = transactions.map(transaction => {
      const transactionObj = transaction.toObject();
      transactionObj.yangi = transaction.createdAt >= oneDayAgo;
      return transactionObj;
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: transactions,
    });
  } catch (error) {
    console.error('GetAllPayments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Get single payment transaction by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'To\'lov tranzaksiyasi topilmadi',
      });
    }

    // Add "yangi" flag (1 kungacha yangi)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const transactionObj = transaction.toObject();
    transactionObj.yangi = transaction.createdAt >= oneDayAgo;

    res.status(200).json({
      success: true,
      data: transactionObj,
    });
  } catch (error) {
    console.error('GetPaymentById Error:', error);
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

// @desc    Get payment statistics
// @route   GET /api/payments/stats/summary
// @access  Private
exports.getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.vaqt = {};
      if (startDate) {
        query.vaqt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.vaqt.$lte = new Date(endDate);
      }
    }

    const totalTransactions = await PaymentTransaction.countDocuments(query);

    // Calculate total sum (extract numbers from string format)
    const transactions = await PaymentTransaction.find(query).select('summa hisobgaOtkazilganSumma');

    let totalSumma = 0;
    let totalHisobgaOtkazilgan = 0;

    transactions.forEach((t) => {
      const summa = parseFloat(t.summa.replace(/[\s,]/g, '')) || 0;
      const hisobgaOtkazilgan = parseFloat(t.hisobgaOtkazilganSumma.replace(/[\s,]/g, '')) || 0;
      totalSumma += summa;
      totalHisobgaOtkazilgan += hisobgaOtkazilgan;
    });

    res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        totalSumma: totalSumma.toLocaleString('uz-UZ', { minimumFractionDigits: 2 }),
        totalHisobgaOtkazilgan: totalHisobgaOtkazilgan.toLocaleString('uz-UZ', { minimumFractionDigits: 2 }),
      },
    });
  } catch (error) {
    console.error('GetPaymentStats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};
