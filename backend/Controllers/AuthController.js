const mongoose  = require("mongoose");
const User = require("../Models/UserModel");
const {createSecretToken} = require("../utils/SecretToken")
const bcrypt = require("bcrypt");

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({ email:email, password:password, username:username, createdAt:createdAt });
    const token = createSecretToken(user._id);
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true,token:token,id: user._id,name: user.username});
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.Login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if(!email || !password ){
        return res.json({message:'All fields are required'})
      }
      const user = await User.findOne({ email:email });
      if(!user){
        return res.json({message:'Incorrect password or email' }) 
      }
      bcrypt.compare(password,user.password,(er,result)=>{
        if(er){
          console.log(er)
        }
        if (!result) {
          return res.json({message:'Incorrect password or email' }) 
        }else{
          const token = createSecretToken(user._id);
          return res.json({ message: "User Logged in successfully", success: true,token:token,id: user._id,name: user.username});
        }
        
      })
    
    } catch (error) {
      console.error(error);
    }
  }

module.exports.UserData = async(req,res)=>{
  
  try {
    const { id } = req.body;
    const data = await User.findById(id);
    if(!data){
      return res.status(404).json({message:'Not Found'})
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}