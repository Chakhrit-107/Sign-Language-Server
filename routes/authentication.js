const express = require("express");
const router = express.Router();

const Authentication = require("../controllers/authenticationController.js");

router.post("/register", Authentication.registerController);
router.post("/login", Authentication.loginController);
router.get("/verify/:token", Authentication.verifyAccountController);

module.exports = router;
