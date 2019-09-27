require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
let path = require('path');
let session = require('express-session');
const mongoose = require('mongoose');
// Router
let router = require('./routers/index');
let app = express();
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser: true,useUnifiedTopology: true ,useFindAndModify: false  },(erro)=>{
  if(erro){
    console.log("Lỗi " + erro);
  }else{
    console.log("Connected to mongodb " + process.env.MONGO_DB);
  }
});
app.use(express.static(__dirname + './../public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');
app.use(session({
    secret: 'phong nguyen',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge:1000*60*3
    }
  }))
app.use('/',router);
app.listen(process.env.PORT,()=>{
    console.log(" website stated in port:" + process.env.PORT);
});