require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
let path = require('path');
let session = require('express-session');
const mongoose = require('mongoose');
// Router
let router = require('./routers/index');
let app = express();
mongoose.connect('mongodb+srv://admin:admin@cluster0-wcu80.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true  },(erro)=>{
  if(erro){
    console.log("Lỗi " + erro);
  }else{
    console.log("Connected to mongodb");
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
  }))
app.use('/',router);
app.listen(process.env.PORT,()=>{
    console.log(" website stated in port:" + process.env.PORT);
});