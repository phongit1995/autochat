var request = require('request-promise');
let common = require('../common/string');
let userModel = require('../models/userInfo');
let listAdmin = require('./../models/listadmin');
let Cache = require('../common/cache-memory');
require('dotenv').config();
const cherrio = require('cheerio');
let index =  async (req,res)=>{

    try {
        
        let optionlogin = {
            method:"get",
            uri:"https://gaubong.us/",
            headers:{
                cookie:req.session.user.cookie,
                'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8'
            }
        }
         let result = await request(optionlogin);
         let $ = cherrio.load(result);
         // number online log
         console.log( $('#container > div.left > a:nth-child(2) > font > font').text());
         let infomationfemaleOnline = Cache.getCache("LIST_INFO_FEMALE_ONLINE");
         if(!infomationfemaleOnline){
            infomationfemaleOnline =  await infoAllfemaleOnline(req.session.user.cookie);
            Cache.SaveCache("LIST_INFO_FEMALE_ONLINE",infomationfemaleOnline);
         }
         console.log(infomationfemaleOnline);
         res.render('client/index' , {infomationfemaleOnline,user:req.session.user});
        

    } catch (error) {
        res.render("client/error");
    }
   
}   
let SendAllMessage = async (req,res)=>{
    let type = req.body.type ;
    let listidOnline = await listidOnlineByTye(req.session.user.cookie,type);
    // console.log(" Danh Sách OnLine");
    // console.log(listidOnline.length);
    let listadmins = await listAdmin.find();
    console.log(listadmins);
    listadmins.forEach((value,index)=>{
        // console.log(value.id);
        // console.log(listidOnline.includes(value.id));
        if(listidOnline.includes( value.id.toString())){
            // console.log('tìm Thấy admins');
            listidOnline=listidOnline.filter(e => e != value.id)
        }
    })
    // console.log(" Danh Sách OnLine sau Khi Check");
    // console.log(listidOnline.length);
    for(let i=0;i<listidOnline.length;i++){
        (function(index) {
            setTimeout(  async()=>{
               let resultrequest = await  sendMessageToUser(req.session.user.cookie,listidOnline[index],req.body.message);
               let obj = {};
               obj.id = listidOnline[index];
               obj.result = resultrequest;
               req.io.sockets.emit("server-send-status-send-message",obj);
            }, i * 5500);
        })(i);
    }
    res.status(200).json({count:listidOnline.length});
}
let  getnumberOnline = async (req,res)=>{
    
    let optionlogin = {
        method:"get",
        uri:"https://gaubong.us/",
        headers:{
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            cookie:req.session.token
        }
    }
     let result = await request(optionlogin);
     let $ = cherrio.load(result);
     return $('#container > div.left > a:nth-child(2) > font > font').text();
}
// INFO ALL FEMALE ONLINE
let infoAllfemaleOnline = async (cookie)=>{
    cookie += 'sex=2';
    console.log(cookie);
    let optionlogin = {
        method:"get",
        uri:"https://gaubong.us/online.html",
        headers:{
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            cookie:cookie
        }
    }
    
    let result = await request(optionlogin);
    let $ = cherrio.load(result);
    let page = $('#ajax-content > div:nth-child(14) > a:nth-child(5)').text();
    console.log( " number page:" + page);
    let arrayPromiess = [];
    let listLink = [];
    for(let i=1;i<=page;i++){
        arrayPromiess.push(idfemaleOnline(cookie,i));
    }
    let resultPromise = await Promise.all(arrayPromiess);
    resultPromise.forEach((item)=>{
        item.forEach((link)=>{
            listLink.push(link);
        })
    })
    let listpromiseinfomationmember = listLink.map((item)=>{
        return getInfoMember( cookie,item);
    })
    let infomation = await Promise.all(listpromiseinfomationmember);
    console.log(infomation);
    return infomation;
   

}
// LIST FEMALE ONLINE SEND MESSAGE
let listidOnlineByTye  = async (cookie,type)=>{
    if(type ==1){
        cookie+= 'sex=2';
    }
    else if(type==2) {
        cookie+= 'sex=1';
    }
    let optionlogin = {
        method:"get",
        // uri:"https://gaubong.us/users/online.php",
         uri:"https://chimbuom.us/modules/?act=online&gt=nu",
        headers:{
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            cookie:cookie
        }
    }
    let result = await request(optionlogin);
     //console.log(result);
    let $ = cherrio.load(result);
    //let page = $('body > div.list1 > div > div > div > div > div > div > div > div > div > div.topmenu > a:nth-child(5)').text() ;

    
    var page =$('#ajax-content > div:nth-child(4) > a:nth-child(5)').text()|| $('#ajax-content > div:nth-child(14) > a:nth-child(5)').text(); 
    
    console.log("page" +page);
    if(isNaN(parseInt(page))){
        // console.log("Parse fail");
        // console.log("page" + $('#ajax-content > div:nth-child(16) > a:nth-child(4)').text());
        page=$('#ajax-content > div:nth-child(5) > a:nth-child(4)').text() || $('#ajax-content > div:nth-child(14) > a:nth-child(4)').text() ;
        page =4 ;
    }
    console.log(page);
    console.log("Số Page:" + page);
    let arrayPromiess = [];
    let listLink = [];
    for(let i=1;i<=page;i++){
        arrayPromiess.push(idfemaleOnline(cookie,i));
    }
    let resultPromise = await Promise.all(arrayPromiess);
    resultPromise.forEach((item)=>{
        item.forEach((link)=>{
            listLink.push(link);
        })
    })
    console.log(listLink);
    return listLink ;
    
}
// NUMBER MALE ONLINE
let numbermaleOnline = async ()=>{
    let optionlogin = {
        method:"get",
        uri:"https://gaubong.us/online.html",
        headers:{
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            cookie:"__cfduid=da3e8ed089e7fb41123e8cc972c5c90a71568875699;SESID=n64ivkljpnqa193vagb1k48b04;cuid=MzAxMjM5;cups=3f7bcb9be0f9d92b3aae909ab0876591;nu=f"
        }
    }
    let result = await request(optionlogin);
    let $ = cherrio.load(result);
    return $('#body > div:nth-child(4) > a:nth-child(5)').text();
}
// ID FEMALE ONLINE IN PAGE
let idfemaleOnline = async (cookie,page)=>{
    let optionlogin = {
        method:"get",
        uri:`https://gaubong.us/modules/?act=online&gt=nu&page=${page}`,
        headers:{
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            cookie:cookie
        }
    }
    let arrayid= [];
    let result = await request(optionlogin);
    let $ = cherrio.load(result);
    let numberlist1 = $('.list1 > table > tbody > tr > td:nth-child(2) > a');
    console.log('Số Danh Sách' ,numberlist1.length);
      for(let i=0 ;i<numberlist1.length;i++){
         let link = numberlist1[i].attribs.href ;
         console.log( 'link là'  +link);
         if(link.indexOf("gaubong.us")==-1){
            arrayid.push(link.slice( link.lastIndexOf("=") +1, link.length));
         }
         
    }
    return arrayid;
}
// GET USER MEMBER BY ID
let getInfoMember = async (cookie,id)=>{
    let optionlogin = {
        method:"get",
        uri:`https://gaubong.us/users/profile.php?user=${id}`,
        headers:{
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            cookie:cookie
        },
       
    }
    let resultRequest = await request(optionlogin);
    let $ = cherrio.load(resultRequest);
    let name = $('#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a > b > font').html() || $('#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a:nth-child(2) > b > span > font').html()|| $('#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a:nth-child(2) > b > font').html() ||
    $('#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a:nth-child(2) > b > span > span > font').html();
    let feel = $('body > div:nth-child(4) > small').text();
    let img = $('#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(1) > img').attr('src');
    return {name:name,feel:feel,id:id,img:img};
}
// SEND MESSAGE TO USER
let sendMessageToUser = async (cookie,id,message)=>{
    // console.log(cookie);
    //console.log(cookie, id ,message);
    let optionlogin = {
        method:"POST",
        uri:`https://gaubong.us/request/?act=send_mail&id=${id}`,
        headers:{
            'Host': 'gaubong.us',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Accept-Language': 'en-US,en;q=0.8',
            'origin':'https://gaubong.us',
            "sec-ch-ua": `"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"`,
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            // 
            "cookie":cookie,
            'referer':`https://gaubong.us/mail/index.php?act=write&id=${id}` ,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36'
        },
        formData:{
            text:message ,
            token:"'.$datauser['priv_key'].'"
        }
    }
    //console.log(optionlogin)
    let resultRequest = await request(optionlogin);

    //console.log(resultRequest);
    console.log(`Send Thành Công  tới: ${id}` + resultRequest);
    return resultRequest ;

}
let login = async (req,res)=>{
    try {
        var options = { method: 'POST',
        url: 'https://gaubong.us/login.php',
        headers: 
        { 'Postman-Token': '1ce33c15-c7e6-4724-8cf2-92640f816c26',
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
            formData: { account: req.body.username, password: req.body.password, m: '1' } 
        } ;
    let result = await request(options);
    res.redirect("/login");
    } catch (error) {
        let result = error.response.headers['set-cookie'].join(";");
        console.log(result);
        let obj = common.parseCookie(result);
        let userinfo = await InfoUser(obj);
        let userdb = await userModel.findUserByUserName(req.body.username.toLowerCase());
        if(!userdb){
            let item = {};
            item.username=req.body.username.toLowerCase();
            item.password= req.body.password ;
            item.taisan= userinfo.taisan;
            item.idweb = userinfo.Idweb;
            item.imageavatar = userinfo.image ;
            let createuser = await userModel.addNewUser(item);
            if(createuser) {
            }
        }
        else {
            let item = {
                password:req.body.password,
                taisan:userinfo.taisan,
                imageavatar : userinfo.image 

            }
            await userModel.updateInfoUser(req.body.username,item);
        }
        req.session.user = userinfo ;
        res.redirect("/");
        
    }
}
const getCookieLogin=async(req,res)=>{
    try {
        var options = { 
        method: 'POST',
        url: 'https://gaubong.us/login.php',
        headers: 
        { 'Postman-Token': '1ce33c15-c7e6-4724-8cf2-92640f816c26',
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' 
        },
            formData: { account: req.body.username, password: req.body.password, m: '1' } 
        } ;
        let result = await request(options);
        return res.status(400).json({message:"login fail"});
    } catch (error) {
        //console.log(error);
        let result = error.response.headers['set-cookie'].join(";");
        let obj = common.parseCookie(result);
        res.status(200).json({cookie:obj})        
    }
}
// Logout User
let logout = (req,res)=>{
    req.session.destroy();
    res.redirect("/");
}
module.exports = {index,SendAllMessage,login,logout,getCookieLogin} 
// Get Info User Login 
let InfoUser =  async(cookie)=>{
    let optionlogin = {
        method:"get",
        uri:"https://gaubong.us/users/profile.php",
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
    let username = $("#container > div.menu > table > tbody > tr > td:nth-child(2) > font.level40").text();
    obj.username = username ;
    let gender = $("body > div:nth-child(10) > font:nth-child(2)").text();
    obj.gender = gender;
    let lever = $("#container > div:nth-child(6) > table > tbody > tr > td:nth-child(2) > font:nth-child(10)").text();
    obj.lever = lever ;
    let taisan = $("#container > div.menu > table > tbody > tr > td:nth-child(2) > font:nth-child(4)").text();
    obj.taisan= taisan;
    let Idweb = $("body > div:nth-child(4) > div > span:nth-child(2) > font").text();
    obj.Idweb = Idweb ;
    let image = $('#container > div.menu > table > tbody > tr > td:nth-child(1) > img').attr('src') ;
    obj.image = image ;
    console.log(obj);
    return obj ;

}