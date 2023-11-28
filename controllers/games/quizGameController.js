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

// Create answer
const findAnswer = (q1, q2, q3, q4, q5) => {
  const answer = [];

  answer.push(q1[createRandomInteger(q1.length)]);
  answer.push(q2[createRandomInteger(q1.length)]);
  answer.push(q3[createRandomInteger(q1.length)]);
  answer.push(q4[createRandomInteger(q1.length)]);
  answer.push(q5[createRandomInteger(q1.length)]);

  return answer;
};

// GET Random question
const getRandomQuestion = async (req, res) => {
  try {
    const category = req.params.category;

    const question = [];

    const q1 = await getRandomVocabularies(category, 3);
    const q2 = await getRandomVocabularies(category, 3);
    const q3 = await getRandomVocabularies(category, 3);
    const q4 = await getRandomVocabularies(category, 3);
    const q5 = await getRandomVocabularies(category, 3);

    const answer = findAnswer(q1, q2, q3, q4, q5);

    question.push(q1, q2, q3, q4, q5, answer);

    return res.json(question);
  } catch (err) {
    console.log("Error get Random Question: ", err);
    return res.status(400).json({ message: "Bad Request." });
  }
};

module.exports = {
  getRandomQuestion,
};
