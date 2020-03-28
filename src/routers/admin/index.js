let express = require('express');
let router= express.Router();
let bufftim = require('./bufftim');
let bufflike = require('./bufflike');
let account = require('./account');
let game = require('./game');
router.use('/bufftim',bufftim);
router.use('/account',account);
router.use('/game',game);
router.use('/bufflike',bufflike);
module.exports = router ;