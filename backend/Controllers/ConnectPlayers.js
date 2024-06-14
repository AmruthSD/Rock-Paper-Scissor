const {allPlayers,io,waitingPlayers} = require('../server.js')


function ConnectPlayers(socket,data){
  
  
    allPlayers[socket.id]={id:data.id,name:data.name}
    allPlayers[socket.id].matchDone = false;
    if(Object.keys(waitingPlayers).length === 0){
      waitingPlayers[socket.id]={id: data.id,name: data.name}
    }
    else{
      const firstKey = Object.keys(waitingPlayers)[0];
      delete waitingPlayers[firstKey];
      allPlayers[socket.id].opp_socket_id = firstKey
      allPlayers[socket.id].opp_id = allPlayers[firstKey].id
      allPlayers[socket.id].opp_name = allPlayers[firstKey].name
      allPlayers[socket.id].score = 0
      allPlayers[socket.id].turn = 'wait'
      allPlayers[firstKey].opp_socket_id = socket.id;
      allPlayers[firstKey].opp_id = data.id;
      allPlayers[firstKey].opp_name = data.name;
      allPlayers[firstKey].score = 0
      allPlayers[firstKey].turn = 'wait'
      io.to(socket.id).emit('Stop-Waiting',{name:allPlayers[firstKey].name,id:allPlayers[firstKey].id})
      io.to(firstKey).emit('Stop-Waiting',{name:data.name,id:data.id})
    }
  }


module.exports={
    ConnectPlayers
}