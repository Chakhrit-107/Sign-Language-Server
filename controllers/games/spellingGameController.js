const sql = require("mssql");

// Create Random Integer
const createRandomInteger = (max) => {
  return Math.floor(Math.random() * max);
};

// Create Random vocabularies = maxVocabulary word
const getRandomVocabularies = async (category, maxVocabulary) => {
  try {
    const request = new sql.Request();

    const query = `SELECT COUNT(*) AS count FROM ${category}`;
    const row = await request.query(query);
    const rowNumber = Number(row.recordset[0].count);

    const usedIds = []; // Check repeated numbers
    const vocabularies = []; // Store vocabularies

    let numRandom;
    while (vocabularies.length < maxVocabulary) {
      do {
        numRandom = createRandomInteger(rowNumber);
      } while (usedIds.includes(numRandom));

      usedIds.push(numRandom);

      const queryRandom = `SELECT *
                            FROM ${category}
                            ORDER BY id
                            OFFSET ${numRandom} ROWS
                            FETCH NEXT 1 ROWS ONLY`;

      const rowRandom = await request.query(queryRandom);
      const vocabulary = rowRandom.recordset[0];

      vocabularies.push(vocabulary);
    }

    return vocabularies;
  } catch (err) {
    console.log("Error get Random Vocabulary: ", err);
    return { message: "Bad Request." };
  }
};

// GET Spelling Character
const getSpellingCharacter = async (req, res) => {
  try {
    const category = req.params.category;
    const vocabulary = [];

    const v1 = await getRandomVocabularies(category, 1);
    const v2 = await getRandomVocabularies(category, 1);
    const v3 = await getRandomVocabularies(category, 1);

    vocabulary.push(v1, v2, v3);

    return res.json(vocabulary);
  } catch (err) {
    console.log("Error get spelling Game", err);
    return res.status(400).json({ message: "Bad Request." });
  }
};

module.exports = {
  getSpellingCharacter,
};
