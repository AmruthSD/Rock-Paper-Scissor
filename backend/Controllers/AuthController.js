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
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res.cookie("id", user._id, {
      withCredentials: true,
      httpOnly: false,
    });
    res.cookie("name", user.username, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
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
      const user = await User.findOne({ email });
      if(!user){
        return res.json({message:'Incorrect password or email' }) 
      }
      const auth = await bcrypt.compare(password,user.password)
      if (!auth) {
        return res.json({message:'Incorrect password or email' }) 
      }
       const token = createSecretToken(user._id);
       res.cookie("token", token, {
         withCredentials: true,
         httpOnly: false,
       });
       res.cookie("id", user._id, {
        withCredentials: true,
        httpOnly: false,
      });
      res.cookie("name", user.username, {
        withCredentials: true,
        httpOnly: false,
      });
       res.status(201).json({ message: "User logged in successfully", success: true });
       next()
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