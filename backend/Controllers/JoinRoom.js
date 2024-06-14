const {roomIDs,roomsPlayers,io,playingWithFriends} = require('../server.js')


function joinRoom(data,socket){
    if(!roomIDs.has(data.roomID) || roomsPlayers[data.roomID].length > 1){
      io.to(socket.id).emit('joining-error',{message:"Room is either full or dosent exist"})
      return;
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

module.exports = {joinRoom}