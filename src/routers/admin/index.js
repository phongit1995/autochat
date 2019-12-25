let express = require('express');
let router= express.Router();
let bufftim = require('./bufftim');
router.use('/bufftim',bufftim);
module.exports = router ;