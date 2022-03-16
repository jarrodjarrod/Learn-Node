const express = require('express');
const { catchErrors } = require('../handlers/errorHandlers');
const storeController = require('../controllers/storeController');

const router = express.Router();

// Do work here
router.get('/', catchErrors(storeController.getStores));

router
  .route('/add')
  .get(storeController.addStore)
  .post(catchErrors(storeController.createStore));

router.get('/stores', catchErrors(storeController.getStores));

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.post('/add/:id', catchErrors(storeController.updateStore));

module.exports = router;
