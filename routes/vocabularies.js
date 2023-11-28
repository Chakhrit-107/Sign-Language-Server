const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Vocabularies = require("../controllers/vocabulariesController.js");

const uploads = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/vocabularies");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  }),
});

router.get("/:categoryName", Vocabularies.getAllVocabularies);
router.get("/userInput/:vocabularyInput", Vocabularies.getVocabularyUserInput);
router.delete("/:tableName/:id", Vocabularies.deleteVocabulary);

router.post(
  "/",
  uploads.fields([
    { name: "img_normal", maxCount: 1 },
    { name: "img_sign_language", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  Vocabularies.createVocabularies
);

router.put(
  "/:id",
  uploads.fields([
    { name: "new_img_normal", maxCount: 1 },
    { name: "new_img_sign_language", maxCount: 1 },
    { name: "new_video", maxCount: 1 },
  ]),
  Vocabularies.updateVocabulary
);

module.exports = router;
