const express = require('express');
const { body } = require('express-validator');
const { catchErrors } = require('../handlers/errorHandlers');
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController.js');

const router = express.Router();

// ======================= Store Routes =====================================
router.get('/', catchErrors(storeController.getStores));

router
  .route('/add')
  .get(authController.isLoggedIn, storeController.addStore)
  .post(
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
  );

router
  .route('/add/:id')
  .post(
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
  );

router.route('/tags').get(storeController.getStoresByTag);
router.route('/tags/:tag').get(storeController.getStoresByTag);

router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.route('/stores/:slug').get(catchErrors(storeController.showStore));

// ======================= User Routes =====================================
router
  .route('/register')
  .get(userController.registerForm)
  .post(
    userController.registerValidations,
    userController.validateRegister,
    catchErrors(userController.register),
    authController.login
  );

router.get('/logout', authController.logout);

router.route('/login').get(userController.loginForm).post(authController.login);

router
  .route('/account')
  .get(authController.isLoggedIn, userController.getAccount)
  .post(catchErrors(userController.updateAccount));

router
  .route('/account/reset/:token')
  .get(catchErrors(authController.checkToken), (req, res) =>
    res.render('reset', { title: 'Reset your password' })
  )
  .post(
    catchErrors(authController.checkToken),
    catchErrors(authController.checkPasswords),
    catchErrors(authController.setNewPassword)
  );

router
  .route('/login/forgot')
  .get(authController.forgotPassword)
  .post(
    body('email')
      .trim()
      .isEmail()
      .withMessage("That's not a valid email")
      .normalizeEmail(),
    catchErrors(authController.emailPasswordReset)
  );

router.get('/map', storeController.mapPage);
router.get('/hearts', catchErrors(storeController.renderHearts));
router.post(
  '/reviews/:id',
  authController.isLoggedIn,
  catchErrors(reviewController.addReview)
);
router.get('/top', catchErrors(storeController.getTopStores));

router.route('/api/v1/search').get(catchErrors(storeController.searchStores));
router.route('/api/v1/stores/near').get(catchErrors(storeController.mapStores));
router
  .route('/api/v1/stores/:id/heart')
  .post(authController.isLoggedIn, catchErrors(storeController.heartStore));

module.exports = router;
