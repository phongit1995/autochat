var request = require('request-promise');
const cherrio = require('cheerio');
let index =  async (req,res)=>{

        let optionlogin = {
            method:"get",
            uri:"https://chimbuom.us/",
            headers:{
                cookie:"__cfduid:__cfduid=d0125683bb4bfe6ce801a50de014cce281568295825;SESID=l3udt8qkfjarhlj55nuu1l37t4;cuid=MTQ5NDc2;cups=3f7bcb9be0f9d92b3aae909ab0876591"
            }
        }
         let result = await request(optionlogin);
         let $ = cherrio.load(result);
         console.log( $('#container > div.left > a:nth-child(2) > font > font').text());
         let infomationfemaleOnline =  await infofemaleOnline();
         res.render('client/index');
        // await getInfoMember(198523);
}   
let  getnumberOnline = async (req,res)=>{
    
    let optionlogin = {
        method:"get",
        uri:"https://chimbuom.us/",
        headers:{
            cookie:"__cfduid:__cfduid=d0125683bb4bfe6ce801a50de014cce281568295825;SESID=l3udt8qkfjarhlj55nuu1l37t4;cuid=MTQ5NDc2;cups=3f7bcb9be0f9d92b3aae909ab0876591"
        }
    }
     let result = await request(optionlogin);
     let $ = cherrio.load(result);
     return $('#container > div.left > a:nth-child(2) > font > font').text();
}

let infofemaleOnline = async ()=>{
    let optionlogin = {
        method:"get",
        uri:"https://chimbuom.us/online.html",
        headers:{
            cookie:"__cfduid:__cfduid=d0125683bb4bfe6ce801a50de014cce281568295825;SESID=l3udt8qkfjarhlj55nuu1l37t4;cuid=MTQ5NDc2;cups=3f7bcb9be0f9d92b3aae909ab0876591;nu=f"
        }
    }
    let result = await request(optionlogin);
    let $ = cherrio.load(result);
    let page = $('#body > div:nth-child(4) > a:nth-child(5)').text();
    console.log(page);
    let arrayPromiess = [];
    let listLink = [];
    for(let i=1;i<=page;i++){
        arrayPromiess.push(idfemaleOnline(i));
    }
    let resultPromise = await Promise.all(arrayPromiess);
    resultPromise.forEach((item)=>{
        item.forEach((link)=>{
            listLink.push(link);
        })
    })
    let listpromiseinfomationmember = listLink.map((item)=>{
        return getInfoMember(item);
    })
    let infomation = await Promise.all(listpromiseinfomationmember);
    console.log(infomation);

}
let listidfemaleOnline  = async ()=>{
    let optionlogin = {
        method:"get",
        uri:"https://chimbuom.us/online.html",
        headers:{
            cookie:"__cfduid:__cfduid=d0125683bb4bfe6ce801a50de014cce281568295825;SESID=l3udt8qkfjarhlj55nuu1l37t4;cuid=MTQ5NDc2;cups=3f7bcb9be0f9d92b3aae909ab0876591;nu=f"
        }
    }
    let result = await request(optionlogin);
    let $ = cherrio.load(result);
    let page = $('#body > div:nth-child(4) > a:nth-child(5)').text();
    console.log(page);
    let arrayPromiess = [];
    let listLink = [];
    for(let i=1;i<=page;i++){
        arrayPromiess.push(idfemaleOnline(i));
    }
    let resultPromise = await Promise.all(arrayPromiess);
    resultPromise.forEach((item)=>{
        item.forEach((link)=>{
            listLink.push(link);
        })
    })
    return listLink ;
}
let numbermaleOnline = async ()=>{
    let optionlogin = {
        method:"get",
        uri:"https://chimbuom.us/online.html",
        headers:{
            cookie:"__cfduid:__cfduid=d0125683bb4bfe6ce801a50de014cce281568295825;SESID=l3udt8qkfjarhlj55nuu1l37t4;cuid=MTQ5NDc2;cups=3f7bcb9be0f9d92b3aae909ab0876591;nam=f"
        }
    }
    let result = await request(optionlogin);
    let $ = cherrio.load(result);
    return $('#body > div:nth-child(4) > a:nth-child(5)').text();
}
let idfemaleOnline = async (page)=>{
    let optionlogin = {
        method:"get",
        uri:`https://chimbuom.us/users/index.php?act=online&page=${page}`,
        headers:{
            cookie:"__cfduid:__cfduid=d0125683bb4bfe6ce801a50de014cce281568295825;SESID=l3udt8qkfjarhlj55nuu1l37t4;cuid=MTQ5NDc2;cups=3f7bcb9be0f9d92b3aae909ab0876591;nu=f"
        }
    }
    let arrayid= [];
    let result = await request(optionlogin);
    let $ = cherrio.load(result);
    let numberlist1 = $("#body > div.list1 > table > tbody > tr > td:nth-child(2)> a:nth-child(2)");
      for(let i=0 ;i<numberlist1.length;i++){
         let link = $("#body > div.list1 > table > tbody > tr > td:nth-child(2)> a:nth-child(2)")[i].attribs.href ;
         arrayid.push(link.slice( link.lastIndexOf("=") +1, link.length));
    }
    let numberlist2 = $("#body > div.list2 > table > tbody > tr > td:nth-child(2)> a:nth-child(2)");
    for(let i=0 ;i<numberlist2.length;i++){
       
        let link = $("#body > div.list2 > table > tbody > tr > td:nth-child(2)> a:nth-child(2)")[i].attribs.href ;
        arrayid.push(link.slice( link.lastIndexOf("=") +1, link.length) );
   }
    return arrayid;
}
let getInfoMember = async (id)=>{
    let optionlogin = {
        method:"get",
        uri:`https://chimbuom.us/users/profile.php?user=${id}`,
        headers:{
            cookie:"__cfduid:__cfduid=d0125683bb4bfe6ce801a50de014cce281568295825;SESID=l3udt8qkfjarhlj55nuu1l37t4;cuid=MTQ5NDc2;cups=3f7bcb9be0f9d92b3aae909ab0876591;nu=f"
        }
    }
    let resultRequest = await request(optionlogin);
    let $ = cherrio.load(resultRequest);
    let name = $('#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a > b > font').html() || $('#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a:nth-child(2) > b > span > font').html()|| $('#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a:nth-child(2) > b > font').html() ||
    $('#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a:nth-child(2) > b > span > span > font').html();
 
    let feel = $('body > div:nth-child(4) > small').text();
    
    return {name:name.trim(),feel:feel,id:id};
}
module.exports = {index}