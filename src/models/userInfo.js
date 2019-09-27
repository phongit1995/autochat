let mongoose = require('mongoose');
const Schema = mongoose.Schema ;
let user = new Schema ({
    username:String,
    password:String,
    LoginFirstAt:{type:Number,default:Date.now},
    name:String,
    UpdatedAt:{type:Number,default:Date.now}
})
module.exports = mongoose.model('user',user);