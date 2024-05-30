const { Signup,Login,UserData } = require("../Controllers/AuthController");
const router = require("express").Router();

router.post("/signup", Signup);
router.post('/login', Login)
router.post('/pro',UserData)
module.exports = router;