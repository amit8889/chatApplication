const router = require('express').Router();
const userController = require("../controller/userController")
const {validate} =  require('../middleware/Auth')
// user registration
router.route('/sendOtp').post(userController.sendOtp);
router.route('/verifyOtp').post(userController.verifyOtp);
router.route('/liveUser').get(validate,userController.liveUser);
module.exports  = router