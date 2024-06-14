const User = require('../Models/UserModel.js')



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

  module.exports = UpdateRating;