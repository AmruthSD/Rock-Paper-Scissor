const express = require("express");
const mongoose = require("mongoose")
const cors = require('cors')
require('dotenv').config();
const cookieParser = require('cookie-parser')
const authRoute = require('./Routes/AuthRouter')
const app = express();
const http = require('http')
const server = http.createServer(app);
const socketIo = require('socket.io');
const User = require('./Models/UserModel')
const {MONGODB_URL,PORT,FRONTEND_URL} = process.env;
const io = socketIo(server,{
  cors: {
    origin: [FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST"],
  }
});



const X = require('./Middlewares/AuthMiddleware')
mongoose.connect(MONGODB_URL).then(()=>console.log("DB connected")).catch(e=>console.log(e))

app.use(
    cors({
      origin: [FRONTEND_URL],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    })
  );


app.use(cookieParser())  
app.use(express.json());
app.use('/',authRoute);
app.use('/pro',X.userVerification)



const waitingPlayers ={};
const allPlayers = {}
const roomIDs =  new Set();
const playingWithFriends = {}
const roomsPlayers = {}

module.exports={
  waitingPlayers,
  allPlayers,
  roomIDs,
  playingWithFriends,
  roomsPlayers,
  io
}

const {ConnectPlayers} = require('./Controllers/ConnectPlayers.js')
const {createRoom} = require('./Controllers/CreateRoom.js')
const {joinRoom} = require('./Controllers/JoinRoom.js')
const {RoundOver} = require('./Controllers/RoundOver.js')
const {priRoundOver} = require('./Controllers/PriRoundOver.js')
const {Disconnect} = require('./Controllers/Disconnect.js')

io.on("connection",(socket)=>{
  
  socket.on('public-connect',(data)=>ConnectPlayers(socket,data))
  socket.on('create-room',(data)=>createRoom(data,socket))
  socket.on('join-room',(data)=>joinRoom(data,socket))
  socket.on('Rmessage',(data)=>{
    io.to(allPlayers[socket.id].opp_socket_id).emit('receiveMess',data)
  })
  socket.on('Pmessage',(data)=>{
    io.to(playingWithFriends[socket.id].opp_socket_id).emit('receiveMess',data)
  })
  socket.on('Turn',(data)=>{
    allPlayers[socket.id].turn = data.turn;
    if(!(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='wait')){
      RoundOver(data,socket);
    }
    else{
      io.to(allPlayers[socket.id].opp_socket_id).emit('Opponent-Finished',{oppfin:true})
    }
  })
  socket.on('priTurn',(data)=>{
    playingWithFriends[socket.id].turn = data.turn;
    if(!(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='wait')){
      priRoundOver(data,socket);
    }
    else{
      io.to(playingWithFriends[socket.id].opp_socket_id).emit('priOpponent-Finished',{oppfin:true})
    }
  })
  socket.on('disconnect',()=>{
    Disconnect(socket)
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});