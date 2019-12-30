let express = require('express');
let router = express.Router();
let UserModels = require('./../../models/userInfo');
let moment = require('moment-timezone');
router.get('/',async(req,res)=>{
    let listUser = await UserModels.find().sort({loginFirstAt:-1});
    res.render('admin/listaccount',{listUser:listUser,moment:moment});
})
module.exports = router ;
