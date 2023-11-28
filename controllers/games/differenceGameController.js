const sql = require("mssql");
const { PROTOCOL, HOST, PORT } = require("../../configs/config.api");

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

// Random Array
function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

// Get Vocabularies DifferenceGam
const getVocabulariesDifferenceGame = async (req, res) => {
  try {
    const category = req.params.category;

    const vocabularies = await getRandomVocabularies(category, 12); // all 12 vocabularies ==> 9 questions and 3 answers

    const vocabulariesSet1 = vocabularies.slice(0, 9); // set 1 ==> 9 questions
    // set 2 ==> 6 questions and 3 answers
    const vocabulariesSet2 = [
      ...vocabularies.slice(0, 6),
      ...vocabularies.slice(9, 12),
    ];

    // Update URL Images vocabularies answer
    const vocabulariesAnswer = vocabularies.slice(9, 12);
    const answerCorrect = vocabulariesAnswer.map((vocabulary) => {
      return {
        ...vocabulary,
        img_normal: `${PROTOCOL}://${HOST}:${PORT}/${vocabulary.img_normal}`,
        img_sign_language: `${PROTOCOL}://${HOST}:${PORT}/${vocabulary.img_sign_language}`,
      };
    });

    // Update URL Images vocabularies set 1
    const vRandomSet1 = shuffleArray(vocabulariesSet1);
    const updateV1 = vRandomSet1.map((vocabulary) => {
      return {
        ...vocabulary,
        img_normal: `${PROTOCOL}://${HOST}:${PORT}/${vocabulary.img_normal}`,
        img_sign_language: `${PROTOCOL}://${HOST}:${PORT}/${vocabulary.img_sign_language}`,
      };
    });

    // Update URL Images vocabularies set 2
    const vRandomSet2 = shuffleArray(vocabulariesSet2);
    const updateV2 = vRandomSet2.map((vocabulary) => {
      return {
        ...vocabulary,
        img_normal: `${PROTOCOL}://${HOST}:${PORT}/${vocabulary.img_normal}`,
        img_sign_language: `${PROTOCOL}://${HOST}:${PORT}/${vocabulary.img_sign_language}`,
      };
    });

    const vocabulariesSet = [updateV1, updateV2, answerCorrect];

    return res.json(vocabulariesSet);
  } catch (err) {
    console.log("Error get vocabularies Difference Game: ", err);
    return res.status(400).json({ message: "Bad Request." });
  }
};

module.exports = {
  getVocabulariesDifferenceGame,
};
