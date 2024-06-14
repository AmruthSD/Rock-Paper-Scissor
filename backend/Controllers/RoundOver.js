const {io,allPlayers} = require('../server.js')
const UpdateRating = require('../utils/UpdateRating.js')


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
  


module.exports = {
    RoundOver
}