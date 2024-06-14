const {allPlayers,io,waitingPlayers} = require('../server.js')


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


module.exports={
    ConnectPlayers
}