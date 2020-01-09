let mongoose = require('mongoose');
const Schema = mongoose.Schema ;
let gameconfig = new Schema ({
    iduser:Number ,
    password:String,
    baicao:Boolean,
    lode:Boolean,
    numberbaicao:Number,
    numberlode:Number 
})
gameconfig.static({
    addNewBuffTim (item){
        return this.create(item) 
    }
})
module.exports = mongoose.model('gameconfig',gameconfig);