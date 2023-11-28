const sql = require("mssql");
const fs = require("fs");
const { PROTOCOL, HOST, PORT } = require("../configs/config.api.js");

// Update URL of image Vocabularies
const updateImageUrls = (vocabularies) => {
  return vocabularies.map((vocabulary) => ({
    ...vocabulary,
    img_normal: `${PROTOCOL}://${HOST}:${PORT}/${vocabulary.img_normal}`,
    img_sign_language: `${PROTOCOL}://${HOST}:${PORT}/${vocabulary.img_sign_language}`,
    video: `${PROTOCOL}://${HOST}:${PORT}/${vocabulary.video}`,
  }));
};

// GET All Vocabularies
const getAllVocabularies = async (req, res) => {
  try {
    const tableName = req.params.categoryName;

    const request = new sql.Request();

    const query = `SELECT * FROM ${tableName}`;
    const results = await request.query(query);

    const updatedUrls = updateImageUrls(results.recordset);

    return res.json(updatedUrls);
  } catch (error) {
    console.error("Error getting data:", error);
    return res.status(400).json({ message: "Bad Request." });
  }
};

// GET Vocabulary => User search
const getVocabularyUserInput = async (req, res) => {
  try {
    const vocabulary = req.params.vocabularyInput;
    const request = new sql.Request();

    const queryCategories = `SELECT categories_name FROM categories`;
    const categories = await request.query(queryCategories);

    const categoryName = categories.recordset.map((category) => {
      return category.categories_name;
    });

    const vocabularyFound = [];
    for (const category of categoryName) {
      const queryInputUser = `SELECT *
                              FROM (
                                  SELECT id, name, img_normal, img_sign_language, video
                                  FROM ${category}
                              ) AS findVocabulary_table
                              WHERE name = '${vocabulary}'`;

      const vocabularyFind = await request.query(queryInputUser);

      if (vocabularyFind.recordset.length > 0) {
        vocabularyFound.push(vocabularyFind.recordset[0]);
      }
    }

    const updatedUrls = updateImageUrls(vocabularyFound);

    return res.json(updatedUrls);
  } catch (err) {
    console.log("Error get input from user: ", err);
    return res.status(400).json({ message: "Bad Request." });
  }
};

// PORT Vocabularies
const createVocabularies = async (req, res) => {
  try {
    const { tableName, vocabulary } = req.body;
    const img_normal = req.files.img_normal[0].path;
    const img_sign_language = req.files.img_sign_language[0].path;
    const video = req.files.video[0].path;

    const request = new sql.Request();

    const query = `INSERT INTO ${tableName} (name, img_normal, img_sign_language, video)
                        VALUES ('${vocabulary}','${img_normal}', '${img_sign_language}', '${video}')`;

    await request.query(query);

    return res.json({ message: "Category Create successfully." });
  } catch (error) {
    console.error("Error posting data:", error);
    return res.status(400).json({ message: "Bad Request." });
  }
};

// DELETE Vocabulary
const deleteVocabulary = async (req, res) => {
  try {
    const id = req.params.id;
    const tableName = req.params.tableName;

    const request = new sql.Request();

    const query = `SELECT img_normal, img_sign_language, video FROM ${tableName} WHERE id = '${id}'`;
    const results = await request.query(query);

    const url_img_video = results.recordset[0];
    if (!url_img_video) {
      console.log("url in database is empty");
      return res.status(500).json({ message: "url in database is empty" });
    }

    const imgNormalPath = url_img_video.img_normal;
    const imgSignLanguagePath = url_img_video.img_sign_language;
    const videoPath = url_img_video.video;

    try {
      await fs.promises.unlink(imgNormalPath);
      await fs.promises.unlink(imgSignLanguagePath);
      await fs.promises.unlink(videoPath);
    } catch (error) {
      console.log("Error unlink img: ", error);
      return res.status(500).json({ message: "Failed to delete image" });
    }

    const deleteQuery = `DELETE FROM ${tableName} WHERE id = '${id}'`;
    await request.query(deleteQuery);

    return res.json({ message: "Vocabulary delete successfully." });
  } catch (error) {
    console.error("Error deleting data:", error);
    return res.status(400).json({ message: "Bad Request." });
  }
};

// PUT Vocabulary
const updateVocabulary = async (req, res) => {
  try {
    const id = req.params.id;
    const { tableName, newVocabulary } = req.body;
    const newImgNormal = req.files.new_img_normal[0].path;
    const newImgSignLanguage = req.files.new_img_sign_language[0].path;
    const newVideo = req.files.new_video[0].path;

    const request = new sql.Request();

    const query = `SELECT img_normal, img_sign_language, video FROM ${tableName} WHERE id = '${id}'`;
    const results = await request.query(query);

    const imgUrls = results.recordset[0];
    if (!imgUrls) {
      console.log("url in database is empty");
      return res.status(500).json({ message: "url in database is empty" });
    }

    const imgNormalPath = imgUrls.img_normal;
    const imgSignLanguagePath = imgUrls.img_sign_language;
    const videoPath = imgUrls.video;

    try {
      await fs.promises.unlink(imgNormalPath);
      await fs.promises.unlink(imgSignLanguagePath);
      await fs.promises.unlink(videoPath);
    } catch (error) {
      console.log("Error unlink img: ", error);
      return res.status(500).json({ message: "Failed to Delete image" });
    }

    const updateQuery = `UPDATE ${tableName} 
                                SET name = '${newVocabulary}',
                                    img_normal = '${newImgNormal}',
                                    img_sign_language = '${newImgSignLanguage}',
                                    video = '${newVideo}'
                                WHERE id = '${id}'`;

    await request.query(updateQuery);

    return res.json({ message: "Vocabulary Update successfully." });
  } catch (error) {
    console.error("Error updating data:", error);
    return res.status(400).json({ message: "Bad Request." });
  }
};

module.exports = {
  getAllVocabularies,
  createVocabularies,
  deleteVocabulary,
  updateVocabulary,
  getVocabularyUserInput,
};
