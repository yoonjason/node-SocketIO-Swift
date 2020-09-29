var express = require("express");
// const { delete } = require('../app');
var router = express.Router();
var http = require("http").Server(express);
var io = require("socket.io")(http);
var typingUsers = {};

var room = io.of("/room");
var aroom = io.of("/a");
var broom = io.of("/b");
var croom = io.of("/c");

var userList = [];

const chatRoom = [
  { name: "1", room: ["test", "b", "c"] },
  { name: "2", room: ["d", "b", "c"] },
];

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("<h1> SocketChat Server</h1>");
});

http.listen(9000, function () {
  console.log("Listining on on *:9000");
});

router.get("/index", (req, res) => {
  // res.send('<h1> Index Server</h1>');
  res.sendFile(__dirname + "/index.html");
});

router.get("/getChatList/room", (request, response) => {
  console.log("chat chat chat test", request);
  const name = request.param.name;
  const list = [];

  chatRoom.forEach((element) => {
    if (element.name == name) {
      list.push(element);
    }
  });

  response.send(list);
});

const chat = io.of("/luffy");
chat.on("connection", function (clientSocket) {
  console.log("luffy1022 connected");
  console.log(clientSocket.id);
});

io.on("connection", function (clientSocket) {
  console.log("roomname :");
  console.log("connect??");

  clientSocket.on("connectUser", function (clientNickname) {
    var message = "User " + clientNickname + " was connected";
    console.log(message);
    console.log(clientSocket.id);
    var userInfo = {};
    var foundUser = false;

    for (var i = 0; i < userList.length; i++) {
      if (userList[i]["nickname"] == clientNickname) {
        userList[i]["isConnected"] = true;
        userList[i]["id"] = clientSocket.id;
        userInfo = userList[i];
        foundUser = true;
        io.emit("userId", clientSocket.id);
        break;
      }
    }

    if (!foundUser) {
      userInfo["id"] = clientSocket.id;
      userInfo["nickname"] = clientNickname;
      userList.push(userInfo);
    }
    console.log("cliendSocketId ~~ :: " + clientSocket.id);
    io.emit("userList", userList);
    io.emit("userConnectUpdate", userInfo);
  });
  clientSocket.on("disconnect", function () {
    console.log("user disconnected");

    //유저가 접속을 끊었을 때 userList에서 id를 삭제한다.
    var clientNickname;
    for (var i = 0; i < userList.length; i++) {
      if (userList[i]["id"] == clientSocket.id) {
        userList[i]["isConnected"] = false;
        clientNickname = userList[i]["nickname"];
        break;
      }
    }

    delete typingUsers[clientNickname];
    io.emit("userList", userList);
    io.emit("userExitUpdate", clientNickname);
    io.emit("userTypingUpdate", typingUsers);
  });

  clientSocket.on("exitUser", function (clientNickname) {
    for (var i = 0; i < userList.length; i++) {
      if (userList[i]["id"] == clientSocket.id) {
        userList.splice(i, 1);
        break;
      }
    }
    io.emit("userExitUpdate", clientNickname);
  });

  clientSocket.on("createRoom", function (data) {
    console.log(data.roomname);
    clientSocket.join(data.roomname);
    console.log("rooms list  : " + io.sockets.manager.rooms);
  });

  clientSocket.on("leaveRoom", function (data) {
    clientSocket.leave(data.room);
  });

  clientSocket.on("toMessage", function (request, response) {
    var currentDateTime = new Date().toLocaleString();
    io.to(request.id).emit("sendServerToMessage", request.message);
    console.log(request.id, request.message);
  });

  clientSocket.on("chatMessage", function (reqeusetData, res) {
    var currentDateTime = new Date().toLocaleString();
    delete typingUsers[reqeusetData];
    io.emit("userTypingUpdate", typingUsers);
    io.emit("newChatMessage", reqeusetData, currentDateTime);
    console.log(
      "nickname : " +
        reqeusetData.nickname +
        " message : " +
        reqeusetData.message
    );
    console.log(reqeusetData.nickname, currentDateTime, "FFFFFFF");
  });

  clientSocket.on("singleChat", function (requestData, response) {
    console.log(
      "SingleChat: :SingleChat : SingleChat " + reqeusetData.roomname + " "
    );
  });
});

room.on("connection", (clientSocket) => {
  console.log("*** test connected ***");
  console.log("clientSocket.id" + clientSocket.id);

  //echo
  //user = 0 , other = 1
  clientSocket.on("test", (msg) => {
    console.log(msg);
    room.emit("test", {
      type: 1,
      message: msg,
    });
  });

  clientSocket.on("disconnect", function () {
    clientSocket.disconnect();
    console.log("test disconnected");
  });
});

module.exports = router;
