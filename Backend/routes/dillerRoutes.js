const express = require('express');
const router = express.Router();
const {
  getAllDillerlar,
  getDiller,
  createDiller,
  updateDiller,
  deleteDiller,
} = require('../controllers/dillerController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getAllDillerlar)
  .post(createDiller);

router.route('/:id')
  .get(getDiller)
  .put(updateDiller)
  .delete(deleteDiller);

module.exports = router;
