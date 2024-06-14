const {generateRandom5DigitString} = require('../utils/RandomString.js')
const {roomIDs,playingWithFriends,roomsPlayers,io} = require('../server.js')

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
  module.exports = {
    createRoom
  }