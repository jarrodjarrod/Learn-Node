const express = require('express');
const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();
const storeController = require('../controllers/storeController');

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.route('/stores').get(storeController.getStores);
router
  .route('/add')
  .get(catchErrors(storeController.addStore))
  .post(catchErrors(catchErrors(storeController.createStore)));

router.route('/stores/:id/edit').get(catchErrors(storeController.editStore));
router.post('/add/:id', catchErrors(storeController.updateStore));

module.exports = router;
