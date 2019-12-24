let express = require('express');
let router= express.Router();
let createaccount = require('./createaccount');
router.use('/createaccount',createaccount);
module.exports = router ;