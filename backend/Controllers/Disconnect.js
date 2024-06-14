const {io,allPlayers,waitingPlayers,playingWithFriends,roomIDs,roomsPlayers} = require('../server.js')
const UpdateRating = require('../utils/UpdateRating.js')
async function Disconnect(socket){
    if(socket.id in allPlayers){
        if(waitingPlayers[socket.id]){
          delete waitingPlayers[socket.id]
          delete allPlayers[socket.id];
        }
        else if(!allPlayers[socket.id].matchDone ){
          allPlayers[allPlayers[socket.id].opp_socket_id].matchDone=true;
          io.to(allPlayers[socket.id].opp_socket_id).emit('Result',{youWin:true})
          await UpdateRating(allPlayers[socket.id].opp_id,allPlayers[socket.id].id)
          delete allPlayers[allPlayers[socket.id].opp_socket_id]
          delete allPlayers[socket.id];
        }
        else if(allPlayers[socket.id].matchDone){
          delete allPlayers[allPlayers[socket.id].opp_socket_id]
          delete allPlayers[socket.id];
        }
      }
      else if(socket.id in playingWithFriends){
        if(playingWithFriends[socket.id].waiting){
          roomIDs.delete(playingWithFriends[socket.id].roomID)
          delete roomsPlayers[playingWithFriends[socket.id].roomID]
          delete playingWithFriends[socket.id]
        }
        else if(!playingWithFriends[socket.id].waiting){
          if(playingWithFriends[socket.id].matchDone){
            roomIDs.delete(playingWithFriends[socket.id].roomID)
            delete roomsPlayers[playingWithFriends[socket.id].roomID]
            delete playingWithFriends[playingWithFriends[socket.id].opp_socket_id]
            delete playingWithFriends[socket.id]
          }
          else{
            io.to(playingWithFriends[socket.id].opp_socket_id).emit('priResult',{youWin:true})
            roomIDs.delete(playingWithFriends[socket.id].roomID)
            delete roomsPlayers[playingWithFriends[socket.id].roomID]
            delete playingWithFriends[playingWithFriends[socket.id].opp_socket_id]
            delete playingWithFriends[socket.id]
          }
        }
      }
}

module.exports = {
    Disconnect
}