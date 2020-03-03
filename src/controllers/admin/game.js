let request = require('request-promise');
let common = require('./../../common/string');
let gameconfig = require('./../../models/game');
let cache = require('./../../common/cache-memory');
const cheerio = require('cheerio')
const URLLODE = 'https://chimbuom.us/game/xosolo.php?act=ketqua';
const URLBAICAO = 'https://chimbuom.us/game/baicao/?Mastic';
const CACHEGAMECONFIG='CACHEGAMECONFIG' ;
const TIMERESET = 5 ;

let playGame = async () =>{
    let usergameconfig = cache.getCache(CACHEGAMECONFIG);
    if(!usergameconfig){
        usergameconfig =  await gameconfig.find();
        cache.SaveCache(CACHEGAMECONFIG,usergameconfig,TIMERESET*60000);
        // console.log('get info mongo');
    }
    let arrayPromise = usergameconfig.map((item)=>{
        return  runPlayGame(item);
    })
    // console.log(usergameconfig); 
    let result = await Promise.all(arrayPromise);
    // let resultBaiCao = await playBaiCao(resultLogin);
     
}
let runPlayGame = async (userinfo)=>{
    let {iduser,password,numberbaicao,numberlode,baicao,lode} = userinfo ;
    // console.log(iduser,password,numberbaicao,numberlode,baicao,lode);
    let resultLogin = await loginid(iduser,password);
    if(!resultLogin){
        return console.log('Đăng Nhập Không Thành Công :' + iduser);
    }
    // console.log(resultLogin);
    if (baicao){
        console.log("Danh bai cao");
        let resultBaiCao = await playBaiCao(resultLogin,numberbaicao);
        // console.log(resultBaiCao);
    }
    if(lode){
        let resultLode = await requestlode(resultLogin,numberlode);
        // console.log(resultLode);
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
    // console.log(result);
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
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}
let playBaiCao = async (sessions,moneybaicao)=>{
    let options = {
         method: 'POST',
    url: URLBAICAO,
    headers: 
     { 'cache-control': 'no-cache',
       Connection: 'keep-alive',
       Cookie: sessions,
       'Content-Length': '19',
       Host: 'chimbuom.us',
       'Postman-Token': 'd178978c-92d7-4930-b508-f1fbfdad88d1,d7017dcc-4458-49f2-9013-1907a3743620',
       'Cache-Control': 'no-cache',
       Accept: '*/*',
       'User-Agent': 'PostmanRuntime/7.20.1',
       'Content-Type': 'application/x-www-form-urlencoded' },
    form: { 
        tien: moneybaicao, 
        ketqua: 'Đánh' 
        } 
    };
    let result = await request(options);
    let $ = cheerio.load(result);
    let resutBaiCao = $('body > div:nth-child(3) > center').text();
    // console.log(result);
    return resutBaiCao ;
}
let requestlode = async (sessions,moneylode)=>{
    let number = randomIntFromInterval(1,99);
    let options = {
     method: 'POST',
    url: URLLODE,
    headers: 
     { 'cache-control': 'no-cache',
       Connection: 'keep-alive',
       Cookie: sessions,
       'Content-Length': '19',
       Host: 'chimbuom.us',
       'Postman-Token': 'd178978c-92d7-4930-b508-f1fbfdad88d1,d7017dcc-4458-49f2-9013-1907a3743620',
       'Cache-Control': 'no-cache',
       Accept: '*/*',
       'User-Agent': 'PostmanRuntime/7.20.1',
       'Content-Type': 'application/x-www-form-urlencoded' },
    form: { 
        tien: moneylode, 
        danh: number 
        } 
    };
    let result = await request(options);
    let $ = cheerio.load(result);
    let resutdanhlo = $('body > div:nth-child(4)').text();
    return resutdanhlo ;
}
module.exports = {
    playGame
}