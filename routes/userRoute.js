const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();

router.route('/register').post(userController.registerUser);
router.route('/login').post(userController.loginUser);
router.route('/password/forget').post(userController.forgotPassword);
router.route('/password/reset/:token').patch(userController.resetPassword);
module.exports = router;
