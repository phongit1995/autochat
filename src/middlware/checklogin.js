
let checkuser = (req,res,next)=>{
    if(!req.session.user){
        req.user = req.session.user ;
        return res.redirect("/login");
    }
    req.user = req.session.user ;
    next();
}
 module.exports = {checkuser} ;