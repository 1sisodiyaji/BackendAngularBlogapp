const express = require("express");
const { Register, Login, GetAll, GetByID, DeleteUser, UserUpdate, saveuserData, GetProfileData } = require("../controller/user.Controller");
const authenticateToken = require("../middleware/Auth");
const router = express.Router();   

router.post("/register",Register);
router.post("/signin",Login);
router.post("/saveuserData",saveuserData);
router.get("/all",GetAll);
router.get("/getbyslug/:slug", GetByID);
router.get("/profile", authenticateToken,GetProfileData);
router.delete("/delete",authenticateToken,DeleteUser);
router.put("/update",authenticateToken,UserUpdate);

module.exports = router;
