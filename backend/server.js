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



io.on("connection",(socket)=>{
  
  socket.on('public-connect',(data)=>ConnectPlayers(socket,data))
  socket.on('Turn',(data)=>{
    allPlayers[socket.id].turn = data.turn;
    if(!(allPlayers[allPlayers[socket.id].opp_socket_id].turn==='wait')){
      RoundOver(data,socket);
    }
    else{
      io.to(allPlayers[socket.id].opp_socket_id).emit('Opponent-Finished',{oppfin:true})
    }
  })
  socket.on('disconnect',()=>{
    
    if(!allPlayers[socket.id].matchDone && allPlayers[socket.id].opp_socket_id!==undefined && allPlayers[allPlayers[socket.id].opp_socket_id]!==undefined){
      allPlayers[allPlayers[socket.id].opp_socket_id].matchDone=true;
      io.to(allPlayers[socket.id].opp_socket_id).emit('Result',{youWin:true})
      UpdateRating(allPlayers[socket.id].opp_id,allPlayers[socket.id].id)
    }
    if(waitingPlayers[socket.id]){
      delete waitingPlayers[socket.id]
    }
    delete allPlayers[socket.id];
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