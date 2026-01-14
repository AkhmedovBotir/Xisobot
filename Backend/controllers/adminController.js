const Admin = require('../models/Admin');
const PaymentTransaction = require('../models/PaymentTransaction');
const Sotuvchi = require('../models/Sotuvchi');
const Diller = require('../models/Diller');
const Config = require('../models/Config');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Get all admins
// @route   GET /api/admin
// @access  Private (SuperAdmin only)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.error('GetAllAdmins Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for admin
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated',
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        adminType: admin.adminType,
      },
    });
  } catch (error) {
    console.error('LoginAdmin Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get current logged in admin
// @route   GET /api/admin/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// Helper function to parse summa string to number
function parseSumma(summaString) {
  if (!summaString) return 0;
  // Remove "UZS", spaces, commas, and convert to number
  // Example: "4,800,000.00 UZS" -> 4800000.00
  const cleaned = summaString.replace(/UZS|,/g, '').trim();
  return parseFloat(cleaned) || 0;
}

// Helper function to build query from request parameters (common for both statistika endpoints)
async function buildStatistikaQuery(req, res) {
  const { 
    startDate,
    endDate,
    keyin,
    telefonRaqami,
    dillerId,
    sotuvchiId
  } = req.query;

  const query = {};

  // Date range filter - priority: keyin > startDate/endDate
  if (keyin && keyin !== 'all' && keyin !== 'hammasi') {
    // keyin is a specific date
    const selectedDate = new Date(keyin);
    if (!isNaN(selectedDate.getTime())) {
      // Set to start of day
      const dateStart = new Date(selectedDate);
      dateStart.setHours(0, 0, 0, 0);
      
      // Set to end of day
      const dateEnd = new Date(selectedDate);
      dateEnd.setHours(23, 59, 59, 999);
      
      query.vaqt = {
        $gte: dateStart,
        $lte: dateEnd
      };
    }
  } else if (startDate || endDate) {
    // Use startDate/endDate if keyin is not provided
    query.vaqt = {};
    if (startDate) {
      query.vaqt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.vaqt.$lte = new Date(endDate);
    }
  }

  // Filter by telefon raqami (mijoz telefon raqami)
  if (telefonRaqami) {
    // Flexible search - match if phone contains or ends with the search term
    query.mijozTelefonRaqami = { 
      $regex: telefonRaqami.replace(/\D/g, ''), // Remove non-digits
      $options: 'i' 
    };
  }

  // Filter by diller - get all sotuvchilar for this diller
  let hasDillerFilter = false;
  if (dillerId) {
    // Validate dillerId
    if (!mongoose.Types.ObjectId.isValid(dillerId)) {
      return {
        error: res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri diller ID formati',
        })
      };
    }

    const dillerSotuvchilar = await Sotuvchi.find({
      dillerlar: new mongoose.Types.ObjectId(dillerId)
    }).select('_id');
    
    const dillerSotuvchilarIds = dillerSotuvchilar.map(s => s._id);
    
    if (dillerSotuvchilarIds.length > 0) {
      hasDillerFilter = true;
      // If also filtering by sotuvchiId, check if it's in the list
      if (sotuvchiId) {
        // Validate sotuvchiId
        if (!mongoose.Types.ObjectId.isValid(sotuvchiId)) {
          return {
            error: res.status(400).json({
              success: false,
              message: 'Noto\'g\'ri sotuvchi ID formati',
            })
          };
        }

        const sotuvchiIdObj = new mongoose.Types.ObjectId(sotuvchiId);
        const isInList = dillerSotuvchilarIds.some(id => id.toString() === sotuvchiIdObj.toString());
        if (isInList) {
          query.sotuvchiId = sotuvchiIdObj;
        } else {
          // Sotuvchi not in diller's list - return null to indicate empty result
          return { query: null, isEmpty: true, message: 'Bu sotuvchi ushbu dillerga biriktirilmagan' };
        }
      } else {
        // Use ObjectIds directly
        query.sotuvchiId = { $in: dillerSotuvchilarIds };
      }
    } else {
      // If no sotuvchilar for this diller - return null to indicate empty result
      return { query: null, isEmpty: true, message: 'Bu diller uchun sotuvchilar topilmadi' };
    }
  } else if (sotuvchiId) {
    // Filter by sotuvchi only (no diller filter)
    // Validate sotuvchiId
    if (!mongoose.Types.ObjectId.isValid(sotuvchiId)) {
      return {
        error: res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri sotuvchi ID formati',
        })
      };
    }
    query.sotuvchiId = new mongoose.Types.ObjectId(sotuvchiId);
  }

  // Only get transactions that are linked to a sotuvchi (if no filter was applied)
  if (!hasDillerFilter && !sotuvchiId && !query.sotuvchiId) {
    query.sotuvchiId = { $exists: true, $ne: null };
  }

  return { query, hasDillerFilter };
}

// @desc    Get statistics with transaction details for admin
// @route   GET /api/admin/statistika
// @access  Private (Admin)
exports.getStatistika = async (req, res) => {
  try {
    const { 
      page = 1,
      limit = 50
    } = req.query;

    // Build query using helper function
    const queryResult = await buildStatistikaQuery(req, res);
    
    // Handle errors or empty results from helper
    if (queryResult.error) {
      return queryResult.error;
    }
    
    if (queryResult.isEmpty) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
        data: [],
        message: queryResult.message || 'Hech narsa topilmadi',
      });
    }

    const { query } = queryResult;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await PaymentTransaction.countDocuments(query);

    // Get transactions with populated sotuvchi and diller
    let transactions = await PaymentTransaction.find(query)
      .populate({
        path: 'sotuvchiId',
        select: 'ism familiya tartibRaqami dillerlar',
        populate: {
          path: 'dillerlar',
          select: 'ism familiya tartibRaqami'
        }
      })
      .sort({ vaqt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-originalMessage -__v');

    // Format response data
    const formattedData = transactions.map(transaction => {
      const transactionObj = transaction.toObject();
      
      // Parse xaridor ismi and familiya (if separated)
      const mijozIsmi = transactionObj.mijozIsmi || '';
      const ismParts = mijozIsmi.trim().split(/\s+/);
      const xaridorIsmi = ismParts[0] || '';
      const xaridorFamiliyasi = ismParts.slice(1).join(' ') || '';
      
      // Calculate qolgan summa (summa - hisobgaOtkazilganSumma)
      const summa = parseSumma(transactionObj.summa);
      const hisobgaOtkazilganSumma = parseSumma(transactionObj.hisobgaOtkazilganSumma);
      const qolganSumma = summa - hisobgaOtkazilganSumma;

      // Get diller info (first diller if multiple)
      let dillerInfo = null;
      if (transactionObj.sotuvchiId && transactionObj.sotuvchiId.dillerlar && transactionObj.sotuvchiId.dillerlar.length > 0) {
        const firstDiller = transactionObj.sotuvchiId.dillerlar[0];
        dillerInfo = {
          _id: firstDiller._id,
          ism: firstDiller.ism,
          familiya: firstDiller.familiya,
          tartibRaqami: firstDiller.tartibRaqami,
          fullName: `${firstDiller.ism} ${firstDiller.familiya}`
        };
      }

      // Get sotuvchi info
      let sotuvchiInfo = null;
      if (transactionObj.sotuvchiId) {
        sotuvchiInfo = {
          _id: transactionObj.sotuvchiId._id,
          ism: transactionObj.sotuvchiId.ism,
          familiya: transactionObj.sotuvchiId.familiya,
          tartibRaqami: transactionObj.sotuvchiId.tartibRaqami,
          fullName: `${transactionObj.sotuvchiId.ism} ${transactionObj.sotuvchiId.familiya}`
        };
      }

      return {
        _id: transactionObj._id,
        xaridorIsmi: xaridorIsmi,
        xaridorFamiliyasi: xaridorFamiliyasi,
        telefonRaqami: transactionObj.mijozTelefonRaqami,
        summa: transactionObj.summa,
        summaNumber: summa,
        qolganSumma: qolganSumma.toFixed(2),
        qolganSummaFormatted: qolganSumma.toLocaleString('uz-UZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' UZS',
        shartnomaRaqami: transactionObj.operatsiyaRaqami,
        sotuvchi: sotuvchiInfo,
        diller: dillerInfo,
        vaqt: transactionObj.vaqt,
        tranzaksiyaId: transactionObj.tranzaksiyaId
      };
    });

    res.status(200).json({
      success: true,
      count: formattedData.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: formattedData,
    });
  } catch (error) {
    console.error('GetStatistika Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Get statistics summary (numbers only) for admin
// @route   GET /api/admin/statistika/raqamlar
// @access  Private (Admin)
exports.getStatistikaRaqamlar = async (req, res) => {
  try {
    // Build query using helper function (same as getStatistika)
    const queryResult = await buildStatistikaQuery(req, res);
    
    // Handle errors or empty results from helper
    if (queryResult.error) {
      return queryResult.error;
    }
    
    if (queryResult.isEmpty) {
      return res.status(200).json({
        success: true,
        data: {
          jamiTranzaksiyalar: 0,
          jamiSumma: 0,
          jamiSummaFormatted: '0.00 UZS',
          jamiHisobgaOtkazilgan: 0,
          jamiHisobgaOtkazilganFormatted: '0.00 UZS',
          qolganSumma: 0,
          qolganSummaFormatted: '0.00 UZS',
          ortachaSumma: 0,
          ortachaSummaFormatted: '0.00 UZS'
        },
        message: queryResult.message || 'Hech narsa topilmadi',
      });
    }

    const { query } = queryResult;

    // Get all transactions matching the query
    const transactions = await PaymentTransaction.find(query).select('summa hisobgaOtkazilganSumma');

    // Calculate statistics
    let jamiTranzaksiyalar = transactions.length;
    let jamiSumma = 0;
    let jamiHisobgaOtkazilgan = 0;

    transactions.forEach((transaction) => {
      jamiSumma += parseSumma(transaction.summa);
      jamiHisobgaOtkazilgan += parseSumma(transaction.hisobgaOtkazilganSumma);
    });

    const qolganSumma = jamiSumma - jamiHisobgaOtkazilgan;
    const ortachaSumma = jamiTranzaksiyalar > 0 ? jamiSumma / jamiTranzaksiyalar : 0;

    res.status(200).json({
      success: true,
      data: {
        jamiTranzaksiyalar: jamiTranzaksiyalar,
        jamiSumma: jamiSumma,
        jamiSummaFormatted: jamiSumma.toLocaleString('uz-UZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' UZS',
        jamiHisobgaOtkazilgan: jamiHisobgaOtkazilgan,
        jamiHisobgaOtkazilganFormatted: jamiHisobgaOtkazilgan.toLocaleString('uz-UZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' UZS',
        qolganSumma: qolganSumma,
        qolganSummaFormatted: qolganSumma.toLocaleString('uz-UZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' UZS',
        ortachaSumma: ortachaSumma,
        ortachaSummaFormatted: ortachaSumma.toLocaleString('uz-UZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' UZS'
      }
    });
  } catch (error) {
    console.error('GetStatistikaRaqamlar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    
    // Get date ranges
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
    
    const last24Hours = new Date(now);
    last24Hours.setHours(last24Hours.getHours() - 24);

    // Base query for linked transactions
    const baseQuery = {
      sotuvchiId: { $exists: true, $ne: null }
    };

    // Helper function to calculate stats for date range
    const calculateStatsForPeriod = async (startDate, endDate) => {
      const query = {
        ...baseQuery,
        vaqt: {
          $gte: startDate,
          $lte: endDate
        }
      };

      const transactions = await PaymentTransaction.find(query).select('summa hisobgaOtkazilganSumma');
      
      let jamiSumma = 0;
      let jamiHisobgaOtkazilgan = 0;
      
      transactions.forEach((transaction) => {
        jamiSumma += parseSumma(transaction.summa);
        jamiHisobgaOtkazilgan += parseSumma(transaction.hisobgaOtkazilganSumma);
      });
      
      const qolganSumma = jamiSumma - jamiHisobgaOtkazilgan;
      
      return {
        jamiTranzaksiyalar: transactions.length,
        jamiSumma: jamiSumma,
        jamiSummaFormatted: jamiSumma.toLocaleString('uz-UZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' UZS',
        jamiHisobgaOtkazilgan: jamiHisobgaOtkazilgan,
        jamiHisobgaOtkazilganFormatted: jamiHisobgaOtkazilgan.toLocaleString('uz-UZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' UZS',
        qolganSumma: qolganSumma,
        qolganSummaFormatted: qolganSumma.toLocaleString('uz-UZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' UZS'
      };
    };

    // Calculate all period stats in parallel
    const [
      umumiyStats,
      bugungiStats,
      kechagiStats,
      haftalikStats,
      oylikStats,
      dillerlarCount,
      faolDillerlarCount,
      sotuvchilarCount,
      faolSotuvchilarCount,
      yangiTranzaksiyalarCount
    ] = await Promise.all([
      // Umumiy stats (all time)
      (async () => {
        const transactions = await PaymentTransaction.find(baseQuery).select('summa hisobgaOtkazilganSumma');
        let jamiSumma = 0;
        let jamiHisobgaOtkazilgan = 0;
        transactions.forEach((t) => {
          jamiSumma += parseSumma(t.summa);
          jamiHisobgaOtkazilgan += parseSumma(t.hisobgaOtkazilganSumma);
        });
        return {
          jamiTranzaksiyalar: transactions.length,
          jamiSumma,
          jamiSummaFormatted: jamiSumma.toLocaleString('uz-UZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) + ' UZS',
          jamiHisobgaOtkazilgan,
          jamiHisobgaOtkazilganFormatted: jamiHisobgaOtkazilgan.toLocaleString('uz-UZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) + ' UZS',
          qolganSumma: jamiSumma - jamiHisobgaOtkazilgan,
          qolganSummaFormatted: (jamiSumma - jamiHisobgaOtkazilgan).toLocaleString('uz-UZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) + ' UZS'
        };
      })(),
      calculateStatsForPeriod(todayStart, now),
      calculateStatsForPeriod(yesterdayStart, yesterdayEnd),
      calculateStatsForPeriod(weekStart, now),
      calculateStatsForPeriod(monthStart, now),
      Diller.countDocuments(),
      Diller.countDocuments({ status: 'active' }),
      Sotuvchi.countDocuments(),
      Sotuvchi.countDocuments({ status: 'active' }),
      PaymentTransaction.countDocuments({
        ...baseQuery,
        createdAt: { $gte: last24Hours }
      })
    ]);

    // Get latest transactions (10)
    const latestTransactions = await PaymentTransaction.find(baseQuery)
      .populate({
        path: 'sotuvchiId',
        select: 'ism familiya tartibRaqami dillerlar',
        populate: {
          path: 'dillerlar',
          select: 'ism familiya tartibRaqami'
        }
      })
      .sort({ vaqt: -1 })
      .limit(10)
      .select('-originalMessage -__v');

    const formattedLatestTransactions = latestTransactions.map(transaction => {
      const transactionObj = transaction.toObject();
      
      const mijozIsmi = transactionObj.mijozIsmi || '';
      const ismParts = mijozIsmi.trim().split(/\s+/);
      const xaridorIsmi = ismParts[0] || '';
      const xaridorFamiliyasi = ismParts.slice(1).join(' ') || '';
      
      const summa = parseSumma(transactionObj.summa);
      const hisobgaOtkazilganSumma = parseSumma(transactionObj.hisobgaOtkazilganSumma);
      const qolganSumma = summa - hisobgaOtkazilganSumma;

      let dillerInfo = null;
      if (transactionObj.sotuvchiId && transactionObj.sotuvchiId.dillerlar && transactionObj.sotuvchiId.dillerlar.length > 0) {
        const firstDiller = transactionObj.sotuvchiId.dillerlar[0];
        dillerInfo = {
          _id: firstDiller._id,
          ism: firstDiller.ism,
          familiya: firstDiller.familiya,
          tartibRaqami: firstDiller.tartibRaqami,
          fullName: `${firstDiller.ism} ${firstDiller.familiya}`
        };
      }

      let sotuvchiInfo = null;
      if (transactionObj.sotuvchiId) {
        sotuvchiInfo = {
          _id: transactionObj.sotuvchiId._id,
          ism: transactionObj.sotuvchiId.ism,
          familiya: transactionObj.sotuvchiId.familiya,
          tartibRaqami: transactionObj.sotuvchiId.tartibRaqami,
          fullName: `${transactionObj.sotuvchiId.ism} ${transactionObj.sotuvchiId.familiya}`
        };
      }

      return {
        _id: transactionObj._id,
        xaridorIsmi: xaridorIsmi,
        xaridorFamiliyasi: xaridorFamiliyasi,
        telefonRaqami: transactionObj.mijozTelefonRaqami,
        summa: transactionObj.summa,
        summaNumber: summa,
        qolganSumma: qolganSumma.toFixed(2),
        qolganSummaFormatted: qolganSumma.toLocaleString('uz-UZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' UZS',
        shartnomaRaqami: transactionObj.operatsiyaRaqami,
        sotuvchi: sotuvchiInfo,
        diller: dillerInfo,
        vaqt: transactionObj.vaqt,
        tranzaksiyaId: transactionObj.tranzaksiyaId
      };
    });

    res.status(200).json({
      success: true,
      data: {
        umumiy: umumiyStats,
        bugungi: bugungiStats,
        kechagi: kechagiStats,
        haftalik: haftalikStats,
        oylik: oylikStats,
        muhimKoRsatkichlar: {
          jamiDillerlar: dillerlarCount,
          faolDillerlar: faolDillerlarCount,
          jamiSotuvchilar: sotuvchilarCount,
          faolSotuvchilar: faolSotuvchilarCount,
          yangiTranzaksiyalar: yangiTranzaksiyalarCount // Oxirgi 24 soat
        },
        soNggiTranzaksiyalar: formattedLatestTransactions
      }
    });
  } catch (error) {
    console.error('GetDashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// Store export status (in production, use Redis or database)
const exportStatuses = new Map();

// Helper function to format date for display
function formatDateForDisplay(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper function to format date only (without time)
function formatDateOnly(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Helper function to get filter description with names (without date)
async function getFilterDescriptionWithNames(req) {
  const { telefonRaqami, dillerId, sotuvchiId } = req.query;
  const filters = [];

  if (telefonRaqami) {
    filters.push(`Telefon raqami: ${telefonRaqami}`);
  }

  if (dillerId) {
    try {
      const diller = await Diller.findById(dillerId);
      if (diller) {
        filters.push(`Diller: ${diller.ism} ${diller.familiya} (${diller.tartibRaqami})`);
      } else {
        filters.push(`Diller ID: ${dillerId}`);
      }
    } catch (error) {
      filters.push(`Diller ID: ${dillerId}`);
    }
  }

  if (sotuvchiId) {
    try {
      const sotuvchi = await Sotuvchi.findById(sotuvchiId);
      if (sotuvchi) {
        filters.push(`Sotuvchi: ${sotuvchi.ism} ${sotuvchi.familiya} (${sotuvchi.tartibRaqami})`);
      } else {
        filters.push(`Sotuvchi ID: ${sotuvchiId}`);
      }
    } catch (error) {
      filters.push(`Sotuvchi ID: ${sotuvchiId}`);
    }
  }

  return filters.length > 0 ? filters.join(', ') : null;
}

// Helper function to get date description
function getDateDescription(req) {
  const { keyin, startDate, endDate } = req.query;

  if (keyin && keyin !== 'all' && keyin !== 'hammasi') {
    return formatDateOnly(keyin);
  } else if (startDate && endDate) {
    return `${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`;
  } else if (startDate) {
    return `${formatDateOnly(startDate)} dan`;
  } else if (endDate) {
    return `${formatDateOnly(endDate)} gacha`;
  } else {
    return 'Barcha sanalar';
  }
}

// @desc    Export statistics to Excel
// @route   GET /api/admin/statistika/export
// @access  Private (Admin)
exports.exportStatistikaToExcel = async (req, res) => {
  const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Set initial status
    exportStatuses.set(exportId, {
      status: 'processing',
      progress: 0,
      message: 'Excel fayl yaratilmoqda...'
    });

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Build query using helper function
    const queryResult = await buildStatistikaQuery(req, res);
    
    if (queryResult.error) {
      exportStatuses.set(exportId, {
        status: 'error',
        progress: 0,
        message: 'Filtrda xatolik'
      });
      return queryResult.error;
    }

    exportStatuses.set(exportId, {
      status: 'processing',
      progress: 20,
      message: 'Ma\'lumotlar yuklanmoqda...'
    });

    if (queryResult.isEmpty) {
      exportStatuses.set(exportId, {
        status: 'error',
        progress: 0,
        message: queryResult.message || 'Hech narsa topilmadi'
      });
      return res.status(200).json({
        success: false,
        exportId,
        message: queryResult.message || 'Hech narsa topilmadi'
      });
    }

    const { query } = queryResult;

    // Get all transactions (no pagination for export)
    const transactions = await PaymentTransaction.find(query)
      .populate({
        path: 'sotuvchiId',
        select: 'ism familiya tartibRaqami dillerlar',
        populate: {
          path: 'dillerlar',
          select: 'ism familiya tartibRaqami'
        }
      })
      .sort({ vaqt: -1 })
      .select('-originalMessage -__v');

    exportStatuses.set(exportId, {
      status: 'processing',
      progress: 40,
      message: 'Excel fayl formatlanmoqda...'
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Statistika');

    // Set column widths
    worksheet.columns = [
      { width: 12 }, // Tartib raqam
      { width: 25 }, // Diller
      { width: 25 }, // Sotuvchi
      { width: 20 }, // Shartnoma raqami
      { width: 20 }, // Xaridor ismi
      { width: 18 }, // Tel nomeri
      { width: 20 }, // OPEN summasi
      { width: 20 }  // Qolgan summa
    ];

    // Get percentage config
    let foizConfig = await Config.findOne({ key: 'hisobga_otkazilgan_foiz' });
    const foiz = foizConfig ? foizConfig.value : 5; // Default to 5% if not set

    // Get filter descriptions
    const filterDescription = await getFilterDescriptionWithNames(req);
    const dateDescription = getDateDescription(req);
    const exportDate = new Date().toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    // Title row
    const titleRow = worksheet.addRow(['STATISTIKA EKSPORT']);
    titleRow.font = { bold: true, size: 16, color: { argb: 'FF000080' } };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells(1, 1, 1, 8);

    // Empty row
    worksheet.addRow([]);

    // Date row (separate from filters)
    const dateRow = worksheet.addRow([`Sana: ${dateDescription}`]);
    dateRow.font = { bold: true, size: 11 };
    dateRow.alignment = { horizontal: 'left' };
    worksheet.mergeCells(3, 1, 3, 8);

    // Filter information row (without date)
    const filterRow = worksheet.addRow([filterDescription || 'Filtrlar: Yo\'q']);
    filterRow.font = { bold: true, size: 11 };
    filterRow.alignment = { horizontal: 'left' };
    worksheet.mergeCells(4, 1, 4, 8);

    // Export date row
    const exportDateRow = worksheet.addRow([`Export vaqti: ${exportDate}`]);
    exportDateRow.font = { size: 10, italic: true };
    exportDateRow.alignment = { horizontal: 'left' };
    worksheet.mergeCells(5, 1, 5, 8);

    // Total count row
    const totalRow = worksheet.addRow([`Jami tranzaksiyalar: ${transactions.length}`]);
    totalRow.font = { bold: true, size: 11 };
    totalRow.alignment = { horizontal: 'left' };
    worksheet.mergeCells(6, 1, 6, 8);

    // Calculate totals first (before adding summary rows)
    let umumiySumma = 0;
    let umumiyHisobgaOtkazilgan = 0;
    transactions.forEach((transaction) => {
      umumiySumma += parseSumma(transaction.summa);
      umumiyHisobgaOtkazilgan += parseSumma(transaction.hisobgaOtkazilganSumma);
    });
    const umumiyHisobgaOtkazilganFoizi = umumiyHisobgaOtkazilgan * (foiz / 100);

    // Empty row
    worksheet.addRow([]);

    // OPEN summasi umumiy summa row (jadvaldan tepada)
    const openSummaRow = worksheet.addRow(['OPEN summasi: ' + umumiySumma.toLocaleString('uz-UZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' UZS']);
    openSummaRow.font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
    openSummaRow.alignment = { horizontal: 'left' };
    worksheet.mergeCells(8, 1, 8, 8);

    // Umumiy summa va foiz row (summani tepasida, bir qatorda)
    const umumiyRow = worksheet.addRow([]);
    // First part: Umumiy summa (chap tomonda) - hisobgaOtkazilganSumma ni umumiysi
    const umumiySummaCell = worksheet.getCell(9, 1);
    umumiySummaCell.value = `Umumiy summa: ${umumiyHisobgaOtkazilgan.toLocaleString('uz-UZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} UZS`;
    umumiySummaCell.font = { bold: true, size: 11, color: { argb: 'FF006600' } };
    umumiySummaCell.alignment = { horizontal: 'left' };
    worksheet.mergeCells(9, 1, 9, 4);

    // Second part: Umumiy hisobga o'tkazilgan summaning foizi (o'ng tomonda, yonida)
    const foizCell = worksheet.getCell(9, 5);
    foizCell.value = `Umumiy hisobga o'tkazilgan summaning ${foiz} foizi: ${umumiyHisobgaOtkazilganFoizi.toLocaleString('uz-UZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} UZS`;
    foizCell.font = { bold: true, size: 11, color: { argb: 'FF006600' } };
    foizCell.alignment = { horizontal: 'left' };
    worksheet.mergeCells(9, 5, 9, 8);

    // Empty row
    worksheet.addRow([]);

    // Table header row
    const headerRow = worksheet.addRow([
      'Tartib raqam',
      'Diller',
      'Sotuvchi',
      'Shartnoma raqami',
      'Xaridor ismi',
      'Tel nomeri',
      'OPEN summasi',
      'Qolgan summa'
    ]);

    // Style header row
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    exportStatuses.set(exportId, {
      status: 'processing',
      progress: 60,
      message: 'Jadval ma\'lumotlari yozilmoqda...'
    });

    // Add data rows
    transactions.forEach((transaction, index) => {
      const transactionObj = transaction.toObject();
      
      const mijozIsmi = transactionObj.mijozIsmi || '';
      const ismParts = mijozIsmi.trim().split(/\s+/);
      const xaridorIsmi = ismParts[0] || '';
      const xaridorFamiliyasi = ismParts.slice(1).join(' ') || '';
      const fullName = xaridorFamiliyasi ? `${xaridorIsmi} ${xaridorFamiliyasi}` : xaridorIsmi;
      
      const summa = parseSumma(transactionObj.summa);
      const hisobgaOtkazilganSumma = parseSumma(transactionObj.hisobgaOtkazilganSumma);
      // Qolgan summa = hisobgaOtkazilganSumma (user talabi bo'yicha)
      const qolganSumma = hisobgaOtkazilganSumma;

      let dillerName = '-';
      if (transactionObj.sotuvchiId && transactionObj.sotuvchiId.dillerlar && transactionObj.sotuvchiId.dillerlar.length > 0) {
        const firstDiller = transactionObj.sotuvchiId.dillerlar[0];
        dillerName = `${firstDiller.ism} ${firstDiller.familiya} (${firstDiller.tartibRaqami})`;
      }

      let sotuvchiName = '-';
      if (transactionObj.sotuvchiId) {
        sotuvchiName = `${transactionObj.sotuvchiId.ism} ${transactionObj.sotuvchiId.familiya} (${transactionObj.sotuvchiId.tartibRaqami})`;
      }

      const dataRow = worksheet.addRow([
        index + 1, // Tartib raqam
        dillerName,
        sotuvchiName,
        transactionObj.operatsiyaRaqami || '-',
        fullName || '-',
        transactionObj.mijozTelefonRaqami || '-',
        transactionObj.summa || '0.00 UZS', // OPEN summasi
        transactionObj.hisobgaOtkazilganSumma || '0.00 UZS' // Qolgan summa (hisobgaOtkazilganSumma)
      ]);

      // Style data rows
      dataRow.alignment = { horizontal: 'left', vertical: 'middle' };
      dataRow.height = 20;
      
      // Alternate row colors
      if (index % 2 === 0) {
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        };
      }

      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        };
      });

      // Update progress
      if ((index + 1) % 100 === 0) {
        const progress = 60 + Math.floor((index + 1) / transactions.length * 30);
        exportStatuses.set(exportId, {
          status: 'processing',
          progress: progress,
          message: `${index + 1} / ${transactions.length} yozuv qo'shildi...`
        });
      }
    });

    exportStatuses.set(exportId, {
      status: 'processing',
      progress: 90,
      message: 'Fayl saqlanmoqda...'
    });

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `statistika_export_${timestamp}.xlsx`;
    const filepath = path.join(uploadsDir, filename);

    // Save workbook
    await workbook.xlsx.writeFile(filepath);

    exportStatuses.set(exportId, {
      status: 'completed',
      progress: 100,
      message: 'Excel fayl tayyor',
      filename: filename,
      downloadUrl: `/api/admin/statistika/export/download/${filename}?exportId=${exportId}`
    });

    res.status(200).json({
      success: true,
      exportId: exportId,
      message: 'Excel fayl muvaffaqiyatli yaratildi',
      filename: filename,
      downloadUrl: `/api/admin/statistika/export/download/${filename}?exportId=${exportId}`,
      status: 'completed'
    });

  } catch (error) {
    console.error('ExportStatistikaToExcel Error:', error);
    exportStatuses.set(exportId, {
      status: 'error',
      progress: 0,
      message: 'Xatolik yuz berdi: ' + error.message
    });
    res.status(500).json({
      success: false,
      exportId: exportId,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Get export status
// @route   GET /api/admin/statistika/export/status/:exportId
// @access  Private (Admin)
exports.getExportStatus = async (req, res) => {
  try {
    const { exportId } = req.params;
    const status = exportStatuses.get(exportId);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Export topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      exportId: exportId,
      ...status
    });
  } catch (error) {
    console.error('GetExportStatus Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Download exported Excel file
// @route   GET /api/admin/statistika/export/download/:filename
// @access  Private (Admin)
exports.downloadExport = async (req, res) => {
  try {
    const { filename } = req.params;
    const { exportId } = req.query;

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filepath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'Fayl topilmadi'
      });
    }

    // Verify exportId if provided
    if (exportId) {
      const status = exportStatuses.get(exportId);
      if (!status || status.filename !== filename) {
        return res.status(403).json({
          success: false,
          message: 'Noto\'g\'ri export ID'
        });
      }
    }

    // Read file and send it, then delete
    const fileBuffer = fs.readFileSync(filepath);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    // Send file
    res.send(fileBuffer);

    // Delete file after sending
    setTimeout(() => {
      try {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          console.log(`File deleted: ${filename}`);
        }
        // Remove from status map after 1 minute
        if (exportId) {
          setTimeout(() => {
            exportStatuses.delete(exportId);
          }, 60000);
        }
      } catch (deleteError) {
        console.error('Delete error:', deleteError);
      }
    }, 1000); // Wait 1 second before deleting

  } catch (error) {
    console.error('DownloadExport Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Get percentage config
// @route   GET /api/admin/config/foiz
// @access  Private (Admin)
exports.getFoizConfig = async (req, res) => {
  try {
    let config = await Config.findOne({ key: 'hisobga_otkazilgan_foiz' });

    // If config doesn't exist, create it with default value 5
    if (!config) {
      config = await Config.create({
        key: 'hisobga_otkazilgan_foiz',
        value: 5,
        description: 'Hisobga o\'tkazilgan summaning foizi (5% default)'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        foiz: config.value,
        description: config.description,
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    console.error('GetFoizConfig Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};

// @desc    Update percentage config
// @route   PUT /api/admin/config/foiz
// @access  Private (Admin)
exports.updateFoizConfig = async (req, res) => {
  try {
    const { foiz } = req.body;

    // Validate foiz
    if (foiz === undefined || foiz === null) {
      return res.status(400).json({
        success: false,
        message: 'Foiz qiymati kiritilishi kerak'
      });
    }

    const foizNumber = parseFloat(foiz);
    if (isNaN(foizNumber) || foizNumber < 0 || foizNumber > 100) {
      return res.status(400).json({
        success: false,
        message: 'Foiz 0 va 100 orasida bo\'lishi kerak'
      });
    }

    // Update or create config
    const config = await Config.findOneAndUpdate(
      { key: 'hisobga_otkazilgan_foiz' },
      {
        value: foizNumber,
        description: `Hisobga o'tkazilgan summaning foizi (${foizNumber}%)`
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Foiz muvaffaqiyatli yangilandi',
      data: {
        foiz: config.value,
        description: config.description,
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    console.error('UpdateFoizConfig Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message,
    });
  }
};
