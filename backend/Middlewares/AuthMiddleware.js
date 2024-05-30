const User = require("../Models/UserModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = process.env;
module.exports.userVerification = async (req, res,next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).send('Access Denied: No Token Provided');
  }
  try {
    
    const verified = jwt.verify(token, SECRET_KEY);
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send('Access Denied: Token Expired');
    }
    return res.status(400).send('Sad')
  }
  
}