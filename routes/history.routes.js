const router     = require('express').Router();
const controller = require('../controllers/history.controller');

router.get('/', controller.getHistory);

module.exports = router;