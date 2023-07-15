const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

//--------login----------------
router.post("/login", userController.getUser);
router.post("/login_admin", userController.getAdmin);
//--------register----------
router.post("/register", userController.postUser);

module.exports = router;
