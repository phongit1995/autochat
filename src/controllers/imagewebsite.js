const config = require('../../config/config');
const ImageModel = require("../models/imageofweb");
let fs = require('fs');
let request = require('request-promise');

let dowLoadImage = async (link)=>{
    let optionRequest = {
        method:"get",
        uri:link ,
        headers:{
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            cookie:"__cfduid=da3e8ed089e7fb41123e8cc972c5c90a71568875699;SESID=n64ivkljpnqa193vagb1k48b04;cuid=MzAxMjM5;cups=3f7bcb9be0f9d92b3aae909ab0876591;nu=f",
        }
    }
    let writefile = fs.createWriteStream("./phong.jpg");
    let result =  await request(optionRequest).pipe(writefile);
   
    return result ;
}
let dowload =  async (req,res)=>{
     let result =  await dowLoadImage("https://gaubong.us/tool/image-upload/files/anh_1568934097.jpg");
    
     res.send(result);
    
}
module.exports = {dowLoadImage,dowload};