const express = require('express');
const router = express.Router();
const {
  getAllAdmins,
  loginAdmin,
  getMe,
  getStatistika,
  getStatistikaRaqamlar,
  getDashboard,
  exportStatistikaToExcel,
  getExportStatus,
  downloadExport,
  getFoizConfig,
  updateFoizConfig,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboard);
router.get('/statistika', protect, getStatistika);
router.get('/statistika/raqamlar', protect, getStatistikaRaqamlar);
router.get('/statistika/export', protect, exportStatistikaToExcel);
router.get('/statistika/export/status/:exportId', protect, getExportStatus);
router.get('/statistika/export/download/:filename', protect, downloadExport);
router.get('/config/foiz', protect, getFoizConfig);
router.put('/config/foiz', protect, updateFoizConfig);
router.get('/', protect, authorize('SuperAdmin'), getAllAdmins);

module.exports = router;

