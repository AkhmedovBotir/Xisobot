const express = require('express');
const router = express.Router();
const {
  getAllSotuvchilar,
  getSotuvchi,
  createSotuvchi,
  updateSotuvchi,
  deleteSotuvchi,
} = require('../controllers/sotuvchiController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getAllSotuvchilar)
  .post(createSotuvchi);

router.route('/:id')
  .get(getSotuvchi)
  .put(updateSotuvchi)
  .delete(deleteSotuvchi);

module.exports = router;
