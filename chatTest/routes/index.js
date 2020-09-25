var express = require('express');
// const { delete } = require('../app');
var router = express.Router();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var typingUsers = {};

var room = io.of('/room');
var aroom = io.of('/a');
var broom = io.of('/b');
var croom = io.of('/c');

var userList = [];


/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('<h1> SocketChat Server</h1>');
});


http.listen(9000, function() {
  console.log('Listining on on *:9000');
})

router.get('/index', (req, res) => {
  // res.send('<h1> Index Server</h1>');
  res.sendFile(__dirname + '/index.html');
})

io.on('connection', function(clientSocket){
  console.log("connect??");

  clientSocket.on('disconnect', function(){
    console.log('user disconnected');

    //유저가 접속을 끊었을 때 userList에서 id를 삭제한다.
    var clientNickname;
    for(var i = 0; i < userList.length; i++){
    if (userList[i]['id'] == clientSocket.id) {
      userList[i]['isConnected'] = false;
      clientNickname = userList[i]['nickname'];
      break;
    }
  }

  delete  typingUsers[clientNickname];
  io.emit('userList', userList);
  io.emit('userExitUpdate', clientNickname);
  io.emit('userTypingUpdate', typingUsers);
  

  });

  clientSocket.on('exitUser', function(clientNickname){
    for (var i = 0; i < userList.length; i++) {
      if (userList[i]['id'] == clientSocket.id) {
        userList.splice(i, 1);
        break;
      }
    }
    io.emit('userExitUpdate', clientNickname);
  })

  clientSocket.on('chatMessage', function(clientNickname, message){
    var currentDateTime = new Date().toLocaleString();
    delete typingUsers[clientNickname];
    io.emit('userTypingUpdate', typingUsers);
    io.emit('newChatMessage', clientNickname, message, currentDateTime);
    console.log(clientNickname, message, currentDateTime);
  }); 

  clientSocket.on('connectUser', function(clientNickname) {
    var message = "User " + clientNickname + " was connected";
    console.log(message);
    console.log(clientSocket.id);
    var userInfo = {};
    var foundUser = false;

    for (var i = 0; i < userList.length; i++) {
      if(userList[i]['nickname'] == clientNickname){
        userList[i]['isConnected'] = true
        userList[i]['id'] = clientSocket.id;
        userInfo = userList[i];
        foundUser = true;
        break;
      }
    }

    if(!foundUser) {
      userInfo['id'] = clientSocket.id;
      userInfo['nickname'] = clientNickname;
      userList.push(userInfo);
    }

    io.emit('userList', userList);
    io.emit('userConnectUpdate', userInfo);
  });


});

room.on('connection', (clientSocket) => {
  console.log('*** test connected ***');
  console.log("clientSocket.id" + clientSocket.id);
  
  //echo
  //user = 0 , other = 1
  clientSocket.on('test', (msg) => {
    console.log(msg);
    room.emit('test', {
      'type' : 1,
      'message' : msg
    })
  });

  clientSocket.on('disconnect', function(){
    clientSocket.disconnect();
    console.log('test disconnected');
  })


})

module.exports = router;
