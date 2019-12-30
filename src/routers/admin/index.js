let express = require('express');
let router= express.Router();
let bufftim = require('./bufftim');
let account = require('./account');
router.use('/bufftim',bufftim);
router.use('/account',account);
module.exports = router ;