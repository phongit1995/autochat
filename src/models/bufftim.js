let mongoose = require('mongoose');
const Schema = mongoose.Schema ;
let bufftim = new Schema ({
    idSend:Number ,
    idRecever:Number,
    created:Number
})
bufftim.static({
    addNewBuffTim (item){
        item.created= Date.now()
        return this.create(item) 
    }
})
module.exports = mongoose.model('bufftim',bufftim);