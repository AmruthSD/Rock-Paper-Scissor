const mongoose  = require("mongoose");
const User = require("../Models/UserModel");

module.exports.Leaderboard = async(req,res)=>{
    try{
        const topUser = await User.find().select('username createdAt rating').sort({rating:-1}).limit(10)
        
        return res.json({info:topUser})
    }catch(e){
        return res.status(400).send('Sad')
    }
}