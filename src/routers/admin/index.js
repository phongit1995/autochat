let express = require('express');
let router= express.Router();
let bufftim = require('./bufftim');
let account = require('./account');
let game = require('./game');
router.use('/bufftim',bufftim);
router.use('/account',account);
router.use('/game',game);
module.exports = router ;