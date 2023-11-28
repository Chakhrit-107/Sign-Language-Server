const sql = require("mssql");
const { PROTOCOL, HOST, PORT } = require("../../configs/config.api");

// Random 3 Number Not redundant
const getRandomNumber = (count, maxNumber) => {
  if (count > maxNumber) {
    throw new Error("Count should be less than or equal to maxNumber");
  }

  const uniqueNumbers = new Set();
  while (uniqueNumbers.size < count) {
    const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
    uniqueNumbers.add(randomNumber);
  }

  return Array.from(uniqueNumbers);
};

const updateImageVideoUrls = (questions) => {
  return questions.map((quiz) => ({
    ...quiz,
    question: `${PROTOCOL}://${HOST}:${PORT}/${quiz.question}`,
    answer_A: `${quiz.answer_A}`,
    image_A: `${PROTOCOL}://${HOST}:${PORT}/${quiz.image_A}`,
    image_sign_A: `${PROTOCOL}://${HOST}:${PORT}/${quiz.image_sign_A}`,
    answer_B: `${quiz.answer_B}`,
    image_B: `${PROTOCOL}://${HOST}:${PORT}/${quiz.image_B}`,
    image_sign_B: `${PROTOCOL}://${HOST}:${PORT}/${quiz.image_sign_B}`,
  }));
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// GET Question Simulation Game
const getQuestionSimulationGame = async (req, res) => {
  try {
    const request = new sql.Request();

    const queryCount = `SELECT COUNT(*) AS count FROM simulationGame`;
    const countRow = await request.query(queryCount);

    const maxCount = countRow.recordset[0].count;
    const randomNumber = getRandomNumber(3, maxCount);

    const queryQuestions = `SELECT * FROM simulationGame WHERE id IN (${randomNumber.join(
      ","
    )})`;
    const result = await request.query(queryQuestions);
    const questions = result.recordset;

    const shuffleQuestions = shuffleArray(questions);
    const updateQuestions = updateImageVideoUrls(shuffleQuestions);

    return res.json(updateQuestions);
  } catch (err) {
    console.log("Error get Question Simulation Game: ", err);
    return { message: "Bad Request." };
  }
};

module.exports = {
  getQuestionSimulationGame,
};
