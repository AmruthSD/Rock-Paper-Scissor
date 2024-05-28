const express = require("express");
const mongoose = require("mongoose")
const cors = require('cors')
require('dotenv').config();
const cookieParser = require('cookie-parser')
const authRoute = require('./Routes/AuthRouter')
const app = express();
const {MONGODB_URL,PORT} = process.env;
const X = require('./Middlewares/AuthMiddleware')
mongoose.connect(MONGODB_URL).then(()=>console.log("DB connected")).catch(e=>console.log(e))

app.use(
    cors({
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    })
  );


app.use(cookieParser())  
app.use(express.json());

app.use('/',authRoute);
app.get('/pro',X.userVerification)


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});




