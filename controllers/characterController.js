const sql = require("mssql");

const { URL } = require("../configs/config.api.js");

// GET Character
const getCharacter = async (req, res) => {
  try {
    const vocabulary = req.params.vocabulary;
    const vocabularyChar = vocabulary.split("");
    const character = [];

    const request = new sql.Request();

    for (const char of vocabularyChar) {
      const query = `SELECT * FROM characterSign WHERE character_text = '${char}'`;
      const results = await request.query(query);
      character.push(results.recordset);
    }

    const innerCharacter = character.flat();
    const updateCharacter = innerCharacter.map((character) => ({
      ...character,
      character_img: `${URL}/${character.character_img}`,
    }));

    return res.json(updateCharacter);
  } catch (error) {
    console.error("Error getting data:", error);
    return res.status(400).json({ message: "Bad Request." });
  }
};

module.exports = {
  getCharacter,
};
