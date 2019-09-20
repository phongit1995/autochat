const express = require('express');
let router = express.Router();
let memberController = require('../controllers/member');
let imagedowload = require('../controllers/imagewebsite');
router.get("/",memberController.index)
router.get("/login",(req,res)=>{
    res.render("client/login");
})
router.post("/",memberController.index);
router.post("/send-message/female", memberController.SendAllMessage);
router.get("/dowloadimage",imagedowload.dowload);
module.exports = router;