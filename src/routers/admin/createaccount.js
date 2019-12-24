let express = require('express');
let router= express.Router();
let Createaccount = require('./../../controllers/admin/createaccount');
router.post('/',Createaccount.createaccount)
module.exports = router ;