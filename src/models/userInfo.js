let mongoose = require('mongoose');
const Schema = mongoose.Schema ;
let user = new Schema ({
    username:String,
    password:String,
    taisan:String,
    idweb:Number,
    imageavatar:String,
    loginFirstAt:{type:Number,default:Date.now},
    lastLoginAt:{type:Number},
    type:Number
})
user.static({
    addNewUser (item){
        return this.create(item) 
    },
    findUserByUserName (username){
        return this.findOne({username:username});
    },
    updateInfoUser(username,user){
        return this.findOneAndUpdate({username:username},{
            password:user.password,
            taisan:user.taisan,
            imageavatar:user.imageavatar,
            lastLoginAt:Date.now()
        })
    }
})
module.exports = mongoose.model('user',user);