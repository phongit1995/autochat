let express = require('express');
let router = express.Router();
let buffTimControllers = require('./../../controllers/admin/bufftim');
let UserModels = require('./../../models/userInfo');
router.get('/',async(req,res)=>{
    let listUser = await UserModels.find({type:1,idweb:{$ne:null}});
    console.log(listUser.length);
    res.render('admin/bufftim',{UserNumber:listUser.length});
})
router.post('/checkUser',async(req,res)=>{
    try {
        let numberbuffed = await buffTimControllers.checkBuffSuff(req.body.id);
        console.log(numberbuffed);
        return res.json({error:'',numberbuffed:numberbuffed.length})
    } catch (error) {
        return res.json({error:error})
    }
    
})
router.post('/sendtim',async(req,res)=>{
    try {
        let {id,numberTim} = req.body ;
        let result = await buffTimControllers.sendTimToUser(id,numberTim);
        console.log(result);
        return res.json({
            error:"",
            data:"Thành Công"
        })
    } catch (error) {
        return res.json({
            error:error
        })
    }
    
})
module.exports = router ;
