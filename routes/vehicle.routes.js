const router     = require('express').Router();
const uploads     = require('../middlewares/uploads.js');
const controller = require('../controllers/vehicle.controller.js');

router.post  ('/import',  uploads.single('file'), controller.importCSV);

router.get ('/', controller.getAll);
router.get ('/:id', controller.getOne);
router.post('/', controller.create);
router.put ('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;