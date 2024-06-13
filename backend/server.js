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
const io = socketIo(server,{
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST"],
  }
});


const {MONGODB_URL,PORT} = process.env;
const X = require('./Middlewares/AuthMiddleware')
mongoose.connect(MONGODB_URL).then(()=>console.log("DB connected")).catch(e=>console.log(e))

app.use(
    cors({
      origin: ["http://localhost:5173"],
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



io.on("connection",(socket)=>{
  
  socket.on('public-connect',(data)=>ConnectPlayers(socket,data))
  socket.on('create-room',(data)=>createRoom(data,socket))
  socket.on('join-room',(data)=>joinRoom(data,socket))
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
  socket.on('disconnect',()=>{/*
    
    if(!allPlayers[socket.id].matchDone && allPlayers[socket.id].opp_socket_id!==undefined && allPlayers[allPlayers[socket.id].opp_socket_id]!==undefined){
      allPlayers[allPlayers[socket.id].opp_socket_id].matchDone=true;
      io.to(allPlayers[socket.id].opp_socket_id).emit('Result',{youWin:true})
      UpdateRating(allPlayers[socket.id].opp_id,allPlayers[socket.id].id)
    }
    if(waitingPlayers[socket.id]){
      delete waitingPlayers[socket.id]
    }
    delete allPlayers[socket.id];
    */
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


function ConnectPlayers(socket,data){
  
  
  allPlayers[socket.id]={id:data.id,name:data.name}
  allPlayers[socket.id].matchDone = false;
  if(Object.keys(waitingPlayers).length === 0){
    waitingPlayers[socket.id]={id: data.id,name: data.name}
  }
  else{
    const firstEntry = Object.entries(waitingPlayers)[0];
    
    const [firstKey, firstValue] = firstEntry;
    delete waitingPlayers[firstEntry];
    firstValue.socket_id = firstKey;
    allPlayers[socket.id].opp_socket_id = firstValue.socket_id
    allPlayers[socket.id].opp_id = firstValue.id
    allPlayers[socket.id].opp_name = firstValue.name
    allPlayers[socket.id].score = 0
    allPlayers[socket.id].turn = 'wait'
    allPlayers[firstValue.socket_id].opp_socket_id = socket.id;
    allPlayers[firstValue.socket_id].opp_id = data.id;
    allPlayers[firstValue.socket_id].opp_name = data.name;
    allPlayers[firstValue.socket_id].score = 0
    allPlayers[firstValue.socket_id].turn = 'wait'
    io.to(socket.id).emit('Stop-Waiting',{name:firstValue.name,id:firstValue.id})
    io.to(firstValue.socket_id).emit('Stop-Waiting',{name:data.name,id:data.id})
  }
}


async function RoundOver(data,socket){
  if(data.turn==='Rock'){
    if(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='Rock'){
      
    }
    if(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='Paper'){
      allPlayers[allPlayers[socket.id].opp_socket_id].score++;
    }
    if(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='Scissor'){
      allPlayers[socket.id].score++;
    }
  }
  if(data.turn==='Paper'){
    if(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='Rock'){
      allPlayers[socket.id].score++;
    }
    if(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='Paper'){
      
    }
    if(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='Scissor'){
      allPlayers[allPlayers[socket.id].opp_socket_id].score++;
    }
    
  }
  if(data.turn==='Scissor'){
    if(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='Rock'){
      allPlayers[allPlayers[socket.id].opp_socket_id].score++;
    }
    if(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='Paper'){
      allPlayers[socket.id].score++;
    }
    if(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='Scissor'){
      
    }
  }
  
  if(allPlayers[socket.id].score===3){
    allPlayers[socket.id].matchDone = true;
    allPlayers[allPlayers[socket.id].opp_socket_id].matchDone = true;
    io.to(socket.id).emit('Result',{youWin:true})
    io.to(allPlayers[socket.id].opp_socket_id).emit('Result',{youWin:false})
    await UpdateRating(allPlayers[socket.id].id,allPlayers[socket.id].opp_id)
  } 
  else if(allPlayers[allPlayers[socket.id].opp_socket_id].score===3){
    allPlayers[socket.id].matchDone = true;
    allPlayers[allPlayers[socket.id].opp_socket_id].matchDone = true;
    io.to(socket.id).emit('Result',{youWin:false})
    io.to(allPlayers[socket.id].opp_socket_id).emit('Result',{youWin:true})
    await UpdateRating(allPlayers[socket.id].opp_id,allPlayers[socket.id].id)
  }
  else{
    io.to(socket.id).emit('Round',{yourScore:allPlayers[socket.id].score , oppScore:allPlayers[allPlayers[socket.id].opp_socket_id].score , oppTurn:allPlayers[allPlayers[socket.id].opp_socket_id].turn})
    io.to(allPlayers[socket.id].opp_socket_id).emit('Round',{yourScore:allPlayers[allPlayers[socket.id].opp_socket_id].score,oppScore:allPlayers[socket.id].score,oppTurn:allPlayers[socket.id].turn})
  }
  allPlayers[socket.id].turn='wait';
  allPlayers[allPlayers[socket.id].opp_socket_id].turn='wait'
}

async function UpdateRating(winner_id,looser_id){
  try {
    const Wdata = await User.findById(winner_id)
    const Ldata = await User.findById(looser_id)
    var diff = 0
    if(Wdata.rating >= Ldata.rating){
      diff = 8;
    }
    else{
      diff = Math.ceil((Ldata.rating - Wdata.rating)/4);
      if(diff>50){
        diff = 50;
      }
      if(diff<8){
        diff = 8;
      } 
    }
    Wdata.rating += diff;
    Ldata.rating -= diff;
    Wdata.save()
    Ldata.save()
    
  } catch (error) {
    console.log(error)
  }
  
}




function generateRandom5DigitString() {
  let randomString = '';
  for (let i = 0; i < 5; i++) {
    const randomDigit = Math.floor(Math.random() * 10);
    randomString += randomDigit.toString();
  }
  return randomString;
}
function getUnique5DigitString() {
  let newString;
  do {
    newString = generateRandom5DigitString();
  } while (roomIDs.has(newString)); 
  roomIDs.add(newString); 
  return newString;
}

function createRoom(data,socket){
  const newRoomID = getUnique5DigitString();
  playingWithFriends[socket.id]= {id:data.id,name:data.name};
  playingWithFriends[socket.id].roomID = newRoomID
  playingWithFriends[socket.id].waiting = true
  roomsPlayers[newRoomID] = [socket.id];
  io.to(socket.id).emit('newRoomID',{roomID:newRoomID,playerNum:0});
}

function joinRoom(data,socket){
  if(!roomIDs.has(data.roomID) || roomsPlayers[data.roomID].length > 1){
    io.to(socket.id).emit('joining-error',{message:"Room is either full or dosent exist"})
  }
  playingWithFriends[socket.id]= {id:data.id,name:data.name};
  playingWithFriends[socket.id].roomID = data.roomID
  playingWithFriends[socket.id].waiting = false
  roomsPlayers[data.roomID].push(socket.id);
  playingWithFriends[roomsPlayers[data.roomID][0]].waiting = false
  playingWithFriends[roomsPlayers[data.roomID][0]].opp_id=data.id
  playingWithFriends[roomsPlayers[data.roomID][0]].opp_socket_id=socket.id
  playingWithFriends[roomsPlayers[data.roomID][0]].opp_name = data.name
  playingWithFriends[socket.id].opp_socket_id = roomsPlayers[data.roomID][0]
  playingWithFriends[socket.id].opp_id = playingWithFriends[roomsPlayers[data.roomID][0]].id
  playingWithFriends[socket.id].opp_name = playingWithFriends[roomsPlayers[data.roomID][0]].name
  playingWithFriends[socket.id].turn = 'wait'
  playingWithFriends[socket.id].score = 0
  playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn = 'wait'
  playingWithFriends[playingWithFriends[socket.id].opp_socket_id].score = 0
  playingWithFriends[socket.id].matchDone = false
  playingWithFriends[playingWithFriends[socket.id].opp_socket_id].matchDone = false 
  io.to(socket.id).emit('startGame',{roomID:data.roomID,playerNum:1,oppName:playingWithFriends[socket.id].opp_name});
  io.to(playingWithFriends[socket.id].opp_socket_id).emit('startGame',{roomID:data.roomID,playerNum:0,oppName:playingWithFriends[socket.id].name});

}


async function priRoundOver(data,socket){
  
  if(data.turn==='Rock'){
    if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='Rock'){
      
    }
    if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='Paper'){
      playingWithFriends[playingWithFriends[socket.id].opp_socket_id].score++;
    }
    if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='Scissor'){
      playingWithFriends[socket.id].score++;
    }
  }
  if(data.turn==='Paper'){
    if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='Rock'){
      playingWithFriends[socket.id].score++;
    }
    if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='Paper'){
      
    }
    if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='Scissor'){
      playingWithFriends[playingWithFriends[socket.id].opp_socket_id].score++;
    }
    
  }
  if(data.turn==='Scissor'){
    if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='Rock'){
      playingWithFriends[playingWithFriends[socket.id].opp_socket_id].score++;
    }
    if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='Paper'){
      playingWithFriends[socket.id].score++;
    }
    if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn==='Scissor'){
      
    }
  }
  
  if(playingWithFriends[socket.id].score===3){
    playingWithFriends[socket.id].matchDone = true;
    playingWithFriends[playingWithFriends[socket.id].opp_socket_id].matchDone = true;
    io.to(socket.id).emit('priResult',{youWin:true})
    io.to(playingWithFriends[socket.id].opp_socket_id).emit('priResult',{youWin:false})
  } 
  else if(playingWithFriends[playingWithFriends[socket.id].opp_socket_id].score===3){
    playingWithFriends[socket.id].matchDone = true;
    playingWithFriends[playingWithFriends[socket.id].opp_socket_id].matchDone = true;
    io.to(socket.id).emit('priResult',{youWin:false})
    io.to(playingWithFriends[socket.id].opp_socket_id).emit('priResult',{youWin:true})
  }
  else{
    io.to(socket.id).emit('priRound',{yourScore:playingWithFriends[socket.id].score , oppScore:playingWithFriends[playingWithFriends[socket.id].opp_socket_id].score , oppTurn:playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn})
    io.to(playingWithFriends[socket.id].opp_socket_id).emit('priRound',{yourScore:playingWithFriends[playingWithFriends[socket.id].opp_socket_id].score,oppScore:playingWithFriends[socket.id].score,oppTurn:playingWithFriends[socket.id].turn})
  }
  playingWithFriends[socket.id].turn='wait';
  playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn='wait'
}