require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
let path = require('path');
let session = require('express-session');
const socketClient = require('./socket-client');
const mongoose = require('mongoose');
// Router
let router = require('./routers/index');
let app = express();
// socket IO 
var server = require('http').Server(app);
var io = require('socket.io')(server);
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser: true,useUnifiedTopology: true ,useFindAndModify: false  },(erro)=>{
  if(erro){
    console.log("Lỗi " + erro);
  }else{
    console.log("Connected to mongodb " + process.env.MONGO_DB);
    
    // Example: Send a message to the server after MongoDB connection is established
  }
});
app.use((req,res,next)=>{
  req.io=io;
  req.socketClient=socketClient;
  next();
})
app.use(express.static(__dirname + './../public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');
app.use(session({
    secret: 'phong nguyen',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge:1000*60*60*12
    }
  }))
app.use('/',router);

server.listen(process.env.PORT,()=>{
    console.log(" website stated in port:" + process.env.PORT);
    console.log("Socket.IO client connection status:", socketClient.socket.connected ? "Connected" : "Not connected");
});

io.on("connection",(socket)=>{
  
})
