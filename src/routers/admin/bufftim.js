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
        if(result instanceof Error){
            return res.json({
                error:result
            })
        }
        return res.json({
            error:"",
            data:"Thành Công"
        })
    } catch (error) {
        console.log('Error'+ error);
        return res.json({
            error:result
        })
    }
    
})
router.get('/accounterror',async(req,res)=>{
    let listUser = await UserModels.find({type:1,idweb:null});
    res.render('admin/listerroraccount',{UserList:listUser});
})
router.post('/changinfo',async(req,res)=>{
    console.log(req.body);
    let {username,idweb} = req.body;
    let resultUpdate = await UserModels.updateOne({username},{idweb});
    if(resultUpdate.n>0){
        return res.json({
            error:""
        })
    }
    else{
        return res.json({
            error:"Có Lỗi Xảy Ra"
        })
    }

;})
module.exports = router ;
