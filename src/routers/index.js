const express = require('express');
let router = express.Router();
let memberController = require('../controllers/member');
let imagedowload = require('../controllers/imagewebsite');
let middlware = require('../middlware/checklogin');
router.get("/", middlware.checkuser,memberController.index)
router.get("/login",(req,res)=>{
    res.render("client/login");
})
// router.post("/",memberController.login);
router.post("/send-all-message", middlware.checkuser,memberController.SendAllMessage);
router.get("/dowloadimage",imagedowload.dowload);
router.post("/login",memberController.login);
router.get("/logout",middlware.checkuser,memberController.logout)
module.exports = router;