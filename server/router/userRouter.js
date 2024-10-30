const router = require('express').Router();
const userController = require("../controller/userController")

// user registration
router.route('/sendOtp').post(userController.sendOtp);
router.route('/verifyOtp').post(userController.verifyOtp);
module.exports  = router