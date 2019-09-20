let mongoose = require('mongoose');
const Schema = mongoose.Schema ;
let imagewebsite = new Schema ({
    userID: String ,
    idImage:String,
    linkImage:String,
    newNameImage:String,
})
module.exports = mongoose.model('imagewebsite',imagewebsite);