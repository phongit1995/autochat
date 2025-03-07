var request = require("request-promise").defaults({
  maxRedirects: 20
});
let common = require("../common/string");
let userModel = require("../models/userInfo");
let listAdmin = require("./../models/listadmin");
let Cache = require("../common/cache-memory");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
require("dotenv").config();
const cherrio = require("cheerio");
const socketClient = require('../socket-client');
let index = async (req, res) => {
  // try {
  //     console.log(req.session.user.cookie);
  //     let optionlogin = {
  //         method:"get",
  //         uri:"https://gaubong.us",
  //         headers:{
  //             cookie:req.session.user.cookie,
  //             'Connection': 'keep-alive',
  //         'Accept-Encoding': '',
  //         'Accept-Language': 'en-US,en;q=0.8',
  //         'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'
  //         }
  //     }
  //      let result = await request(optionlogin);
  //      let $ = cherrio.load(result);
  //      // number online log
  //      console.log( $('#container > div.left > a:nth-child(2) > font > font').text());
  //      let infomationfemaleOnline = Cache.getCache("LIST_INFO_FEMALE_ONLINE");
  //      if(!infomationfemaleOnline){
  //         infomationfemaleOnline =  await infoAllfemaleOnline(req.session.user.cookie);
  //         Cache.SaveCache("LIST_INFO_FEMALE_ONLINE",infomationfemaleOnline);
  //      }
  //      console.log(infomationfemaleOnline);
  //      res.render('client/index' , {infomationfemaleOnline,user:req.session.user});

  // } catch (error) {
  //     console.log(error);
  //     res.render("client/error");
  // }
  let infomationfemaleOnline = [];
  res.render("client/index", {
    infomationfemaleOnline,
    user: req.session.user,
  });
};
let SendAllMessage = async (req, res) => {

  // return await getDataSendMessage(req.session.user.cookie, '722530');
  let type = req.body.type;
  console.log(type);
  let listidOnline = await listidOnlineByTye(req.session.user.cookie, type);
  console.log(" Danh Sách OnLine");
  console.log(listidOnline.length);
  let listadmins = await listAdmin.find();
  // listadmins =[{
  //    id:2007
  // }]
  console.log("list admin", listadmins);
  let listUserOnline = [];
  // listadmins.forEach((value, index) => {
  //   // console.log(value.id);
  //   // console.log(listidOnline.includes(value.id));
  //   if (!listidOnline.includes(value.id.toString())) {
  //     // console.log('tìm Thấy admins');
  //     listidOnline = listidOnline.filter((e) => e != value.id);
  //   }
  // });
  listidOnline.forEach((user) => {
    const check = false;
    let listCheck = listadmins.filter((e) => e.id.toString() == user.toString());
    if (listCheck.length == 0) {
      listUserOnline.push(user);
    }
  });
  console.log(" Danh Sách OnLine sau Khi Check");
  console.log(listUserOnline.length);
  for (let i = 0; i < listUserOnline.length; i++) {
    (function (index) {
      setTimeout(async () => {
        try {
          let resultrequest = await sendMessageToUser(
            req.session.user.cookie,
            listUserOnline[index],
            req.body.message
          );
          let obj = {};
          obj.id = listUserOnline[index];
          obj.result = resultrequest;
          req.io.sockets.emit("server-send-status-send-message", obj);
        } catch (error) {
          console.log('send message error to user :', error)
          req.io.sockets.emit("server-send-status-send-message", {});
        }
      }, i * 12000);
    })(i);
  }
  res.status(200).json({
    count: listidOnline.length
  });
};

let getnumberOnline = async (req, res) => {
  let optionlogin = {
    method: "get",
    uri: "https://gaubong.us/",
    headers: {
      Connection: "keep-alive",
      "Accept-Encoding": "",
      "Accept-Language": "en-US,en;q=0.8",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
      cookie: req.session.token,
    },
  };
  let result = await request(optionlogin);
  let $ = cherrio.load(result);
  return $("#container > div.left > a:nth-child(2) > font > font").text();
};
// INFO ALL FEMALE ONLINE
let infoAllfemaleOnline = async (cookie) => {
  cookie += "sex=2";
  console.log(cookie);
  let optionlogin = {
    method: "get",
    uri: "https://gaubong.us/online.html",
    headers: {
      Connection: "keep-alive",
      "Accept-Encoding": "",
      "Accept-Language": "en-US,en;q=0.8",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
      cookie: cookie,
    },
  };

  let result = await request(optionlogin);
  let $ = cherrio.load(result);
  let page = $("#ajax-content > div:nth-child(14) > a:nth-child(5)").text();
  console.log(" number page:" + page);
  let arrayPromiess = [];
  let listLink = [];
  for (let i = 1; i <= page; i++) {
    arrayPromiess.push(idfemaleOnline(cookie, i));
  }
  let resultPromise = await Promise.all(arrayPromiess);
  resultPromise.forEach((item) => {
    item.forEach((link) => {
      listLink.push(link);
    });
  });
  let listpromiseinfomationmember = listLink.map((item) => {
    return getInfoMember(cookie, item);
  });
  let infomation = await Promise.all(listpromiseinfomationmember);
  console.log(infomation);
  return infomation;
};
const deplayTime = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}
// LIST FEMALE ONLINE SEND MESSAGE
let listidOnlineByTye = async (cookie, type) => {
  try {
    if (type == 1) {
      cookie += "sex=2";
    } else if (type == 2) {
      cookie += "sex=1";
    }
    let optionlogin = {
      method: "get",
      // uri:"https://gaubong.us/users/online.php",
      uri: "https://gaubong.us/users/online/nu",
      headers: {
        Connection: "keep-alive",
        "Accept-Encoding": "",
        "Accept-Language": "en-US,en;q=0.8",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
        cookie: cookie,
      },
    };
    let result = await request(optionlogin);
    console.log(result);
    let $ = cherrio.load(result);

    var page =
      $("#page_content > div:nth-child(5) > div > a:nth-child(5)").text() ||
      $("#page_content > div:nth-child(3) > div > a:nth-child(6)").text();

    console.log("page" + page);
    if (isNaN(parseInt(page))) {
      page =
        $("#ajax-content > div:nth-child(5) > a:nth-child(4)").text() ||
        $("#ajax-content > div:nth-child(14) > a:nth-child(4)").text();
      page = 15;
    }
    console.log(page);
    console.log("Số Page:" + page);
    let arrayPromiess = [];
    let listLink = [];
    for (let i = 1; i <= page; i++) {
      // arrayPromiess.push(idfemaleOnline(cookie, i));
      const data = await idfemaleOnline(cookie, i);
      console.log('data', data);
      data.forEach((link) => {
        listLink.push(link);
      });
      await deplayTime(500)
    }
    console.log(listLink);
    return listLink;
  } catch (error) {

  }

};
// NUMBER MALE ONLINE
let numbermaleOnline = async () => {
  let optionlogin = {
    method: "get",
    uri: "https://gaubong.us/users/index.php?act=online&mod=nu",
    headers: {
      Connection: "keep-alive",
      "Accept-Encoding": "",
      "Accept-Language": "en-US,en;q=0.8",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
      cookie: "__cfduid=da3e8ed089e7fb41123e8cc972c5c90a71568875699;SESID=n64ivkljpnqa193vagb1k48b04;cuid=MzAxMjM5;cups=3f7bcb9be0f9d92b3aae909ab0876591;nu=f",
    },
  };
  let result = await request(optionlogin);
  let $ = cherrio.load(result);
  return $("#body > div:nth-child(4) > a:nth-child(5)").text();
};
// ID FEMALE ONLINE IN PAGE
let idfemaleOnline = async (cookie, page) => {
  let optionlogin = {
    method: "get",
    uri: `https://gaubong.us/users/online/nu?page=${page}`,
    headers: {
      Connection: "keep-alive",
      "Accept-Encoding": "",
      "Accept-Language": "en-US,en;q=0.8",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
      cookie: cookie,
    },
  };
  let arrayid = [];
  let result = await request(optionlogin);
  let $ = cherrio.load(result);
  let numberlist1 = $(
    ".card-body > table > tbody > tr > td:nth-child(2) > div:nth-child(1) > a"
  );
  console.log("Số Danh Sách", numberlist1.length);
  for (let i = 0; i < numberlist1.length; i++) {
    let link = numberlist1[i].attribs.href;
    console.log("link là" + link);
    if (link.indexOf("gaubong.us") == -1) {
      arrayid.push(link.slice(link.lastIndexOf("=") + 1, link.length));
    }
  }
  return arrayid;
};
// GET USER MEMBER BY ID
let getInfoMember = async (cookie, id) => {
  let optionlogin = {
    method: "get",
    uri: `https://gaubong.us/users/profile.php?user=${id}`,
    headers: {
      Connection: "keep-alive",
      "Accept-Encoding": "",
      "Accept-Language": "en-US,en;q=0.8",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
      cookie: cookie,
    },
  };
  let resultRequest = await request(optionlogin);
  let $ = cherrio.load(resultRequest);
  let name =
    $(
      "#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a > b > font"
    ).html() ||
    $(
      "#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a:nth-child(2) > b > span > font"
    ).html() ||
    $(
      "#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a:nth-child(2) > b > font"
    ).html() ||
    $(
      "#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a:nth-child(2) > b > span > span > font"
    ).html();
  let feel = $("body > div:nth-child(4) > small").text();
  let img = $(
    "#body > div:nth-child(2) > div > table > tbody > tr > td:nth-child(1) > img"
  ).attr("src");
  return {
    name: name,
    feel: feel,
    id: id,
    img: img
  };
};
// SEND MESSAGE TO USER
let RadomText = [".", ",", "<3", "(", ")", "..", ",,", "[", "]"];
// get TokenSendMessage

const getDataSendMessage = async (cookie, id) => {
  const options = {
    method: "GET",
    uri: `https://gaubong.us/mail/write/?id=${id}`,
    headers: {
      Host: "gaubong.us",
      Accept: "*/*",
      Connection: "keep-alive",
      "Accept-Language": "en-US,en;q=0.8",
      origin: "https://gaubong.us",
      "sec-ch-ua": `"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"`,
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      //
      cookie: cookie,
      referer: `https://gaubong.us/mail/index.php?act=write&id=${id}`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36",
    }
  }
  const data = await request(options);
  const dataJson = JSON.parse(data);
  const csrf_token = dataJson.csrf_token;
  const $ = cherrio.load(dataJson.content);
  const token = $('#submit_mail_write').attr('token');
  return {
    csrf_token,
    token
  }
}
let sendMessageToUser = async (cookie, id, message) => {
  // console.log(cookie);
  //console.log(cookie, id ,message);
  try {
    const dataToken = await getDataSendMessage(cookie, id);
    console.log('dataToken', dataToken);
    let optionlogin = {
      method: "POST",
      uri: `https://gaubong.us/api/mail/write/post/?id=${id}`,
      headers: {
        Host: "gaubong.us",
        Accept: "*/*",
        Connection: "keep-alive",
        "Accept-Language": "en-US,en;q=0.8",
        origin: "https://gaubong.us",
        "sec-ch-ua": `"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"`,
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        //
        cookie: cookie,
        referer: `https://gaubong.us/mail/index.php?act=write&id=${id}`,
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36",
      },
      // formData: {
      //   text: message + RadomText[Math.floor(Math.random() * RadomText.length)],
      //   token: dataToken.token,
      //   csrf_token: dataToken.csrf_token,
      // },
      body: `text=${message + RadomText[Math.floor(Math.random() * RadomText.length)]}&reply=&token=${dataToken.token}&csrf_token=null`
    };
    //console.log(optionlogin)
    let resultRequest = await request(optionlogin);

    //console.log(resultRequest);
    console.log(`Send Thành Công  tới: ${id}` );
    // console.log(JSON.parse(resultRequest)); 
    
    // Gửi token từ kết quả trả về
    // socketClient.sendMessage('messenger', JSON.parse(resultRequest)?.token);
    
    return resultRequest;
  } catch (error) {
    console.log('error', error);
    console.log(`Send Thất Bại  tới: ${id}`);
  }

};
const getCookieFirstLogin = async (req, res) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36');
  await page.goto("https://gaubong.us/", {
    timeout: 45000,
    waitUntil: 'networkidle0'
  })
  const cookies = await page.cookies();
  await page.authenticate();
  console.log('cookies', cookies);
  const tokenRef = await page.evaluate(() => store);
  let result = "";
  for (let cookie of cookies) {
    result += `${cookie.name}=${cookie.value};`;
  }
  await browser.close();
  return {
    cookie: result,
    token: tokenRef.csrf_token
  };
}
const getLogin = async (req, res) => {

  const data = await getCookieFirstLogin();
  req.session.preCookie = data.cookie;
  req.session.token = data.token;

  res.render("client/login");
}
let login = async (req, res) => {
  console.log('req.session.preCookie', req.session.preCookie,req.session.token)
  try {
    var options = {
      method: "POST",
      url: "https://gaubong.us/login",
      headers: {
        "Postman-Token": "f20afd7e-8400-4eb2-8a4d-2b2451b81c73",
        "cache-control": "no-cache",
        'Connection': 'keep-alive',
        'Host': 'gaubong.us',
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
        'Referer': 'https://gaubong.us',
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36",
        'cookie': req.session.preCookie,
      },
      formData: {
        submit: 'Đăng nhập',
        account: req.body.username,
        password: req.body.password,
        mem: "on",
        // csrf_token: req.session.token,
      },
    };
    let result = await request(options);
    res.redirect("/login");
  } catch (error) {
    console.log(error.response.headers);
    let result = error.response.headers["set-cookie"]?.join(";");
    console.log("cookie", result);
    let obj = common.parseCookie(req.session.preCookie + result);
    let userinfo = await InfoUser(obj);
    let userdb = await userModel.findUserByUserName(
      req.body.username.toLowerCase()
    );
    if (!userdb) {
      let item = {};
      item.username = req.body.username.toLowerCase();
      item.password = req.body.password;
      item.taisan = userinfo.taisan;
      item.idweb = userinfo.Idweb;
      item.imageavatar = userinfo.image;
      let createuser = await userModel.addNewUser(item);
      if (createuser) {}
    } else {
      let item = {
        password: req.body.password,
        taisan: userinfo.taisan,
        imageavatar: userinfo.image,
      };
      await userModel.updateInfoUser(req.body.username, item);
    }
    req.session.user = userinfo;
    res.redirect("/");
  }
};
const getCookieLogin = async (req, res) => {
  try {
    var options = {
      method: "POST",
      url: "https://gaubong.us/login.html?view_as=view_as",
      headers: {
        "Postman-Token": "1ce33c15-c7e6-4724-8cf2-92640f816c26",
        "cache-control": "no-cache",
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
      },
      formData: {
        account: req.body.username,
        password: req.body.password,
        m: "on",
      },
    };
    let result = await request(options);
    return res.status(400).json({
      message: "login fail"
    });
  } catch (error) {
    //console.log(error);
    let result = error.response.headers["set-cookie"].join(";");
    let obj = common.parseCookie(result);
    res.status(200).json({
      cookie: obj
    });
  }
};
// Logout User
let logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

// Get Info User Login
let InfoUser = async (cookie) => {
  let optionlogin = {
    method: "get",
    uri: "https://gaubong.us/profile",
    headers: {
      cookie: cookie,
      Connection: "keep-alive",
      "Accept-Encoding": "",
      "Accept-Language": "en-US,en;q=0.8",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
    },
  };
  let result = await request(optionlogin);
  let obj = {};
  obj.cookie = cookie;
  let $ = cherrio.load(result);
  let username = $(
    "#container > div.menu > table > tbody > tr > td:nth-child(2) > font.level40"
  ).text();
  obj.username = username;
  let gender = $("body > div:nth-child(10) > font:nth-child(2)").text();
  obj.gender = gender;
  let lever = $(
    "#container > div:nth-child(6) > table > tbody > tr > td:nth-child(2) > font:nth-child(10)"
  ).text();
  obj.lever = lever;
  let taisan = $(
    "#container > div.menu > table > tbody > tr > td:nth-child(2) > font:nth-child(4)"
  ).text();
  obj.taisan = taisan;
  let Idweb = $(
    "body > div:nth-child(4) > div > span:nth-child(2) > font"
  ).text();
  obj.Idweb = Idweb;
  let image = $(
    "#container > div.menu > table > tbody > tr > td:nth-child(1) > img"
  ).attr("src");
  obj.image = image;
  console.log(obj);
  return obj;
};

let getListUser = async (req, res) => {
  let type = 1;
  console.log(type);
  let listidOnline = await listidOnlineByTye(req.session.user.cookie, type);
  console.log(" Danh Sách OnLine");
  console.log(listidOnline.length);
  let listadmins = await listAdmin.find();
  // listadmins =[{
  //    id:2007
  // }]
  console.log("list admin", listadmins);
  let listUserOnline = [];
  listadmins.forEach((value, index) => {
    if (!listidOnline.includes(value.id.toString())) {
      listidOnline = listidOnline.filter((e) => e != value.id);
    }
  });

  console.log(" Danh Sách OnLine sau Khi Check");
  console.log(listUserOnline.length);
  res.status(200).json({
    listData: listidOnline
  });
};
let sendMessageUser = async (req, res) => {
  const {
    userId,
    message
  } = req.body;
  try {
    const result = await sendMessageToUser(
      req.session.user.cookie,
      userId,
      message
    );
    res.status(200).json(result);
  } catch (error) {

  }
};
module.exports = {
  index,
  SendAllMessage,
  login,
  logout,
  getCookieLogin,
  getListUser,
  sendMessageUser,
  getLogin,
};