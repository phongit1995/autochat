let bufftimModels = require('./../../models/bufftim');
let UserModel = require('./../../models/userInfo');
let request = require('request-promise');
let common = require('./../../common/string');
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
let sendTimToUser = async (idUser,numberTim)=>{
    try {
        let sublist = await checkBuffSuff(idUser);
        let sublistnotIn = sublist.map((item)=>{
            return item.idSend;
        })
        let UserList =  await UserModel.find({
           type:1,
           idweb:{$nin:sublistnotIn,$ne:null}

        })
        console.log(UserList.length , numberTim)
        if(UserList.length<numberTim){
            throw new Error('Vượt Quá Số Khả Năng Like');
        }
        UserList = UserList.slice(0,numberTim);
        console.log(UserList);
        let resutPromisse = UserList.map(async(item)=>{
            return await BuffTimUser(item.idweb,item.password,idUser);
        })
        let result = await Promise.all(resutPromisse);
        console.log(result);
        return result ;
        
    } catch (error) {
        return  new Error (error);
    }
}
let BuffTimUser =async(idUser,password,idTo)=>{
    let resultLogin = await loginid(idUser,password);
    if(!resultLogin){
        await UserModel.deleteOne({idweb:idUser,password:password});
    }else
    {
        let options = {
        url:`https://chimbuom.us/users/like.php?id=${idTo}`,
        method:'get',
        headers:{
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            cookie:resultLogin
            }
        }
            try {
                let result =  await request(options);
                await bufftimModels.addNewBuffTim({idSend:idUser,idRecever:idTo});
                return result;
            } catch (error) {
                console.log('erro'+ error);
            }
    }
    
}
let loginid = async(id,password)=>{
    try {
        var options = { 
            method: 'POST',
            url: 'https://chimbuom.us/loginid.php',
        headers: 
            { 'Postman-Token': '1ce33c15-c7e6-4724-8cf2-92640f816c26',
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
            form: {
                'account': id,
                'password': password,
                'mem': '1'
              }
        } ;
    let result = await request(options);
    return false ;
    } catch (error) {
        if(error.statusCode){
            let result = error.response.headers['set-cookie'].join(";");
            let cookie = common.parseCookie(result);
            return cookie
        }
        return false
    }
}

module.exports ={
    createbufftim,
    checkBuffSuff,
    loginid,
    sendTimToUser
}
