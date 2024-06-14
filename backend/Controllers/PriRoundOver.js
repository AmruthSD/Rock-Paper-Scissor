const {playingWithFriends,io} = require('../server.js')

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
      io.to(socket.id).emit('priRound',{yourScore:playingWithFriends[socket.id].score , oppScore:playingWithFriends[playingWithFriends[socket.id].opp_socket_id].score , oppTurn:playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn,yourTurn:playingWithFriends[socket.id].turn})
      io.to(playingWithFriends[socket.id].opp_socket_id).emit('priRound',{yourScore:playingWithFriends[playingWithFriends[socket.id].opp_socket_id].score,oppScore:playingWithFriends[socket.id].score,oppTurn:playingWithFriends[socket.id].turn,yourTurn:playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn})
    }
    playingWithFriends[socket.id].turn='wait';
    playingWithFriends[playingWithFriends[socket.id].opp_socket_id].turn='wait'
  }

module.exports ={
    priRoundOver
}