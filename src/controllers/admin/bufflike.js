let request = require('request-promise');
let common = require('./../../common/string');
let UserModel = require('./../../models/userInfo');
let sendLikeToPost = async(idPost, numberLike)=>{
    let UserArray = await UserModel.aggregate([
        { $sample: { size: parseInt(numberLike) } }
    ])
    let ArrayPromise = UserArray.map((item)=>{
        console.log(item.idweb,item.password)
        return BuffLikeUser(item.idweb,item.password,idPost);
    })
    // console.log(UserArray);
    let resultBuff = await Promise.all(ArrayPromise);
    return resultBuff ;
    // await BuffLikeUser(UserArray[0].idweb,UserArray[0].password,130974);
}
let BuffLikeUser =async(idUser,password,idTo)=>{
    let resultLogin = await loginid(idUser,password);
    if(!resultLogin){
        await UserModel.deleteOne({idweb:idUser,password:password});
    }else
    {
        let options = {
        url:`https://chimbuom.us/tool/image-upload/like.php?id=${idTo}&page=1`,
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
                return result ;
            } catch (error) {
                console.log('erro'+ error);
                return error ;
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
module.exports = {
    sendLikeToPost
}