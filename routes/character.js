const express = require("express");
const router = express.Router();

const Character = require("../controllers/characterController.js");

router.get("/:vocabulary", Character.getCharacter);

module.exports = router;
