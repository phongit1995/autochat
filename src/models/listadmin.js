let mongoose = require('mongoose');
const Schema = mongoose.Schema ;
let listadmin = new Schema ({
    id:Number 
})

module.exports = mongoose.model('listadmin',listadmin);