require('dotenv').config();
var request = require('request-promise');
let UserModels = require('./../../models/userInfo');
let createaccount = async (req,res)=>{
    console.log(req.body);
    let name = {
        username:'phonghn5',
        password:'phongvip'
    }
    let data = await requesetCreateAccount(name);
    
}
module.exports  = {createaccount} 

let requesetCreateAccount  = async({username,password})=>{
    console.log(username);
    console.log(password);
    let option ={
        method:"post",
        uri:"https://chimbuom.us/registration.php",
        headers:{
        'Connection': 'keep-alive',
        'Accept-Encoding': '',
        'Accept-Language': 'en-US,en;q=0.8',
        'cookie':'SESID=b7rbc2lfjubh3d07jh0k4dffk0; path=/; domain=.gaubong.us;'
        },
        formData: { 
            account: username, 
            password:password, 
            sex: 'm',
            captcha:'84hp'
        }
    }
    let result = await request(option);
    console.log(result);
}