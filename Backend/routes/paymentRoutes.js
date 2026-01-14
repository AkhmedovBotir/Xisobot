const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getPaymentById,
  getPaymentStats,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/stats/summary', getPaymentStats);
router.route('/')
  .get(getAllPayments);

router.route('/:id')
  .get(getPaymentById);

module.exports = router;
