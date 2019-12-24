let request= require('request-promise');
let UserModel = require('./../models/userInfo');
let common = require('./../common/string');
let cherrio = require('cheerio');
let index = (req,res)=>{
    res.render('client/donateaccount');
}
let donatepost =async (req,res)=>{
    console.log(req.body);
    let  {username,password} = req.body ;
    let result = await login(username,password) ;
    if(!result){
        return res.json({
            error:'SAI TÀI KHOẢN HOẶC MẬT KHẨU'
        })
    }
    let {Idweb} = await InfoUser(result);
    let User = await UserModel.findOne({username:username,password:password});
    if(User){
        return res.json({
            error:'TÀI kHOẢN ĐÃ TỒN TẠI'
        })
    }
    else{
        await UserModel.create({username:username,password:password,type:1,idweb:Idweb});
        return res.json({
            error:null,
            data:"Thành Công"
        })
    }

}
module.exports = {
    index ,donatepost
}
let login = async (username,password)=>{
    try {
        var options = { method: 'POST',
        url: 'https://chimbuom.us/login.php',
        headers: 
        { 'Postman-Token': '1ce33c15-c7e6-4724-8cf2-92640f816c26',
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
            formData: { account: username, password:password, m: '1' } 
        } ;
    let result = await request(options);
    return false ;
    } catch (error) {
        console.log(error.statusCode);
        if(error.statusCode){
            let result = error.response.headers['set-cookie'].join(";");
            let cookie = common.parseCookie(result);
            return cookie
        }
        return false
    }
}
let InfoUser =  async(cookie)=>{
    let optionlogin = {
        method:"get",
        uri:"https://chimbuom.us/users/profile.php",
        headers:{
        cookie:cookie,
        'Connection': 'keep-alive',
        'Accept-Encoding': '',
        'Accept-Language': 'en-US,en;q=0.8'
        }
    }
    let result = await request(optionlogin);
    let obj = {} ;
    obj.cookie = cookie ;
    let $ = cherrio.load(result);
    let username = $("#container > div.menu > table > tbody > tr > td:nth-child(2) > b > font").text();
    obj.username = username ;
    let gender = $("body > div:nth-child(10) > font:nth-child(2)").text();
    obj.gender = gender;
    let lever = $("body > div:nth-child(10) > font:nth-child(5)").text();
    obj.lever = lever ;
    let taisan = $("body > div:nth-child(10) > font:nth-child(9)").text();
    obj.taisan= taisan;
    let Idweb = $("body > div:nth-child(4) > div > span:nth-child(2) > font").text();
    obj.Idweb = Idweb ;
    let image = $('#container > div.menu > table > tbody > tr > td:nth-child(1) > img').attr('src') ;
    obj.image = image ;
    return obj ;

}