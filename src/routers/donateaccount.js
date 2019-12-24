let express = require('express');
let router = express.Router();
let UserModel = require('./../models/userInfo');
let donateAccountController = require('./../controllers/donateaccount');
router.get('/',donateAccountController.index);
router.post('/',donateAccountController.donatepost)
module.exports = router ;