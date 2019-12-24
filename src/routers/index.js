const express = require('express');
let router = express.Router();
let memberController = require('../controllers/member');
let imagedowload = require('../controllers/imagewebsite');
let middlware = require('../middlware/checklogin');
let adminRouter = require('./admin/index');
let donateAccount = require('./donateaccount');
router.get("/", middlware.checkuser,memberController.index)
router.get("/login",(req,res)=>{
    res.render("client/login");
})
// router.post("/",memberController.login);
router.post("/send-all-message", middlware.checkuser,memberController.SendAllMessage);
router.get("/dowloadimage",imagedowload.dowload);
router.post("/login",memberController.login);
router.get("/logout",middlware.checkuser,memberController.logout) ;
router.use('/admin',adminRouter);
router.use('/donateaccount',donateAccount);
module.exports = router;