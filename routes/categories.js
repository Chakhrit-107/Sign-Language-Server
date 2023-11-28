const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Categories = require("../controllers/categoriesController.js");

const uploads = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/categories");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  }),
});

router.get("/", Categories.getAllCategories);
router.get("/games/:vMinimum", Categories.getCategoriesGames);
router.delete("/:category/:id", Categories.deleteCategory);

router.post(
  "/",
  uploads.fields([
    { name: "img_normal", maxCount: 1 },
    { name: "img_sign_language", maxCount: 1 },
  ]),
  Categories.createCategory
);

router.put(
  "/:id",
  uploads.fields([
    { name: "img_normal", maxCount: 1 },
    { name: "img_sign_language", maxCount: 1 },
  ]),
  Categories.updateCategory
);

module.exports = router;
