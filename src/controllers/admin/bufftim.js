let bufftimModels = require('./../../models/bufftim');

let createbufftim = async (item)=>{
    let result = await bufftimModels.addNewBuffTim(item);
    return result ;
}
let checkBuffSuff = async(idUser)=>{
    let numberSuff = await bufftimModels.find({
        idRecever:idUser
    })
    return numberSuff;
}
module.exports ={
    createbufftim,
    checkBuffSuff
}