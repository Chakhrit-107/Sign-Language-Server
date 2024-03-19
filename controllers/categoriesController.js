const sql = require("mssql");
const fs = require("fs");
const { URL } = require("../configs/config.api.js");

// Update URL of image Categories
const updateImageUrls = (categories) => {
  return categories.map((category) => ({
    ...category,
    img_normal: `${URL}/${category.img_normal}`,
    img_sign_language: `${URL}/${category.img_sign_language}`,
  }));
};

// GET Categories of play games
const getCategoriesGames = async (req, res) => {
  try {
    const vMinimum = req.params.vMinimum;
    const request = new sql.Request();

    const queryCategories = "SELECT * FROM categories";
    const resultsCategories = await request.query(queryCategories);
    const categories = resultsCategories.recordset;

    const searchPromises = categories.map(async (category) => {
      const tableName = category.categories_name;
      const rowCountQuery = `SELECT COUNT(*) AS count FROM ${tableName}`;
      const rowCountResult = await request.query(rowCountQuery);
      const rowCount = rowCountResult.recordset[0].count;

      if (rowCount >= vMinimum) {
        return category;
      }
      return null;
    });

    const categoryData = await Promise.all(searchPromises);

    const filteredCategories = categoryData.filter(
      (category) => category !== null
    );

    const updatedUrls = updateImageUrls(filteredCategories);

    return res.json(updatedUrls);
  } catch (err) {
    console.error("Error getting categories of games:", err);
    return res.status(400).json({ message: "Bad Request." });
  }
};

// GET All Categories
const getAllCategories = async (req, res) => {
  try {
    const request = new sql.Request();

    const query = "SELECT * FROM categories";
    const results = await request.query(query);

    const updatedUrls = updateImageUrls(results.recordset);

    return res.json(updatedUrls);
  } catch (error) {
    console.error("Error getting categories:", error);
    return res.status(400).json({ message: "Bad Request." });
  }
};

// POST Category
const createCategory = async (req, res) => {
  try {
    const { categories_name } = req.body;
    const newCategories = categories_name.replace(/-/g, "_");
    const img_normal = req.files.img_normal[0].path;
    const img_sign_language = req.files.img_sign_language[0].path;

    const request = new sql.Request();

    const query = `INSERT INTO categories (categories_name, img_normal, img_sign_language)
                        VALUES ('${newCategories}', '${img_normal}', '${img_sign_language}')`;

    await request.query(query);

    const newCategoryTable = `CREATE TABLE ${newCategories} (
                                    id INT PRIMARY KEY IDENTITY(1,1),
                                    name VARCHAR(255) NOT NULL,
                                    img_normal VARCHAR(255) NOT NULL,
                                    img_sign_language VARCHAR(255) NOT NULL,
                                    video VARCHAR(255) NOT NULL
                                );`;

    await request.query(newCategoryTable);

    return res.json({ message: "Category Create successfully." });
  } catch (error) {
    console.error("Error posting data:", error);
    return res.status(400).json({ message: "Bad Request." });
  }
};

// DELETE Category
const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryName = req.params.category;

    const request = new sql.Request();

    const query = `SELECT img_normal, img_sign_language FROM categories WHERE id = '${id}'`;
    const result = await request.query(query);

    const imgUrls = result.recordset[0];
    if (!imgUrls) {
      console.log("url in database is empty");
      return res.status(500).json({ message: "url in database is empty" });
    }

    const imgNormalPath = imgUrls.img_normal;
    const imgSignLanguagePath = imgUrls.img_sign_language;

    try {
      await fs.promises.unlink(imgNormalPath);
      await fs.promises.unlink(imgSignLanguagePath);
    } catch (error) {
      console.log("Error unlink img: ", error);
      return res.status(500).json({ message: "Failed to delete image" });
    }

    const findUrlsQuery = `SELECT img_normal, img_sign_language, video FROM ${categoryName}`;
    const urls = await request.query(findUrlsQuery);

    const unlinkPromises = [];
    urls.recordset.forEach((url) => {
      if (url) {
        const imgNormalUrl = url.img_normal;
        const imgSignUrl = url.img_sign_language;
        const videoUrl = url.video;

        unlinkPromises.push(fs.promises.unlink(imgNormalUrl));
        unlinkPromises.push(fs.promises.unlink(imgSignUrl));
        unlinkPromises.push(fs.promises.unlink(videoUrl));
      }
    });

    await Promise.all(unlinkPromises);

    const deleteQuery = `DELETE FROM categories WHERE id = '${id}'`;
    await request.query(deleteQuery);

    const deleteCategoryTable = `DROP TABLE ${categoryName}`;
    await request.query(deleteCategoryTable);

    return res.json({
      message: "Category delete and Table delete successfully.",
    });
  } catch (error) {
    console.error("Error deleting data:", error);
    return res.status(400).json({ message: "Bad Request." });
  }
};

// PUT Category
const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { categories_name } = req.body;
    const newCategories = categories_name.replace(/-/g, "_");
    const img_normal = req.files.img_normal[0].path;
    const img_sign_language = req.files.img_sign_language[0].path;

    const request = new sql.Request();

    const query = `SELECT categories_name, img_normal, img_sign_language FROM categories WHERE id = '${id}'`;
    const result = await request.query(query);

    const categoryOld = result.recordset[0];
    if (!categoryOld) {
      console.log("url in database is empty");
      return res.status(500).json({ message: "url in database is empty" });
    }

    const imgNormalPath = categoryOld.img_normal;
    const imgSignLanguagePath = categoryOld.img_sign_language;
    const oldCategory = categoryOld.categories_name; // from data base

    try {
      await fs.promises.unlink(imgNormalPath);
      await fs.promises.unlink(imgSignLanguagePath);
    } catch (error) {
      console.log("Error unlink img: ", error);
      return res.status(500).json({ message: "Failed to Delete image" });
    }

    const updateQuery = `UPDATE categories 
                                SET categories_name = '${newCategories}',
                                    img_normal = '${img_normal}',
                                    img_sign_language = '${img_sign_language}'
                                WHERE id = '${id}'`;

    await request.query(updateQuery);

    const createNewTableQuery = `
            CREATE TABLE ${newCategories} (
                id INT PRIMARY KEY IDENTITY(1,1),
                name VARCHAR(255) NOT NULL,
                img_normal VARCHAR(255) NOT NULL,
                img_sign_language VARCHAR(255) NOT NULL,
                video VARCHAR(255) NOT NULL
            );`;

    await request.query(createNewTableQuery);

    const copyDataQuery = `
            INSERT INTO ${newCategories} (name, img_normal, img_sign_language, video)
            SELECT name, img_normal, img_sign_language, video
            FROM ${oldCategory};
        `;

    await request.query(`SET IDENTITY_INSERT ${newCategories} ON`);
    await request.query(copyDataQuery);
    await request.query(`SET IDENTITY_INSERT ${newCategories} OFF`);

    const dropOldTableQuery = `DROP TABLE ${oldCategory};`;
    await request.query(dropOldTableQuery);

    return res.json({
      message: "Category Update and Table Rename successfully.",
    });
  } catch (error) {
    console.error("Error update data:", error);
    res.status(400).json({ message: "Bad Request." });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoriesGames,
};
