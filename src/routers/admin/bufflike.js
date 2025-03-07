let express = require('express');
let router = express.Router();
let {sendLikeToPost} = require('./../../controllers/admin/bufflike');
router.get('/',async(req,res)=>{
    res.render('admin/bufflike');
})
router.post('/sendlike',async (req,res)=>{
    try {
        let result = await sendLikeToPost(req.body.id,req.body.numberLike);
        // console.log(result);
        return res.json({
            error:"",
            data:"Thành Công"
        })
    } catch (error) {
        return res.json({
            error:result
        })
    }
    
})
module.exports = router ;