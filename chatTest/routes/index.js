var express = require('express');
// const { delete } = require('../app');
var router = express.Router();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var typingUsers = {};

var room = io.of('/ff');
var aroom = io.of('/a');
var broom = io.of('/b');
var croom = io.of('/c');

var userList = [];

var chatRoom = [
{
  'name' : 1,
  'room' : ["test", "a", "b"]
},
{
  'name' : 2,
  'room' : ["d", "b", "c"]
}
]


/* GET home page. */
router.get('/', function(req, res, next) {
  room.emit('ff', {
    'Hello' : 'World',
    'test' : 'good'
  })
  res.send('<h1> SocketChat Server</h1>');
});


http.listen(9000, function() {
  console.log('Listining on on *:9000');
})

router.get('/getChatList/:name', (req, res) => {
  const name = req.params.name;
  const list = []

  chatRoom.forEach(element => {
    if (element.name == name) {
      list.push(element);
    }
  });
  res.send(list);
});

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

io.on('connection', (socket) => {
  console.log('a user connected');


})


room.on('connection', (clientSocket) => {
  console.log('*** test connected ***');
  console.log(clientSocket.id + 'ㅁㄴ이;라ㅓㅁ니라ㅓㅁㄴ이라ㅓㄴㅁ;');
  console.log('clientSocket'+ clientSocket );
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

  clientSocket.on('event', (msg) => { 
    console.log(msg);
    console.log(msg["message"]);
    console.log('*****');
  })

  clientSocket.on('event1', (msg) => {
    console.log(msg);
    console.log(msg[0]["name"]);
    console.log(msg[0]["email"]);
    console.log('***** event1');

    clientSocket.emit('test', {'res' : 'event1 response!'});
  })  

  clientSocket.on('event2', (msg) => {
    console.log(msg);
    console.log(msg["name"]);
    console.log(msg["email"]);
    console.log('***** event2');

    clientSocket.emit('test', {'res' : 'event2 response!'});
  })

  clientSocket.on('eventString', (msg) => {
    console.log(msg);
    console.log(msg["nickname"]);
    console.log(msg["eventString"]);
  })

})

module.exports = router;
