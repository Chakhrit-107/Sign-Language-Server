const sql = require("mssql");
const { URL } = require("../../configs/config.api.js");
const { createCanvas, loadImage } = require("canvas");

// Convert Position
const convertPosition = async (positions) => {
  try {
    const topPositions = [];
    const leftPositions = [];
    positions.forEach((pos) => {
      if (pos) {
        topPositions.push(pos.top);
        leftPositions.push(pos.left);
      }
    });

    return { topPositions, leftPositions };
  } catch (error) {
    console.log("Error convert Position: ", err);
  }
};

// Draw line Connect
const drawLine = async (context, xStart, yStart, xEnd, yEnd) => {
  try {
    context.beginPath();
    context.moveTo(xStart, yStart);
    context.lineTo(xEnd, yEnd);
    context.stroke();
  } catch (err) {
    console.log("Error draw line: ", err);
  }
};

// Create Line Image URL
const createLineConnectBlock = async (req, res) => {
  try {
    const { screen, positionQuiz, positionAnswer } = req.body;

    const positionQuestion = await convertPosition(positionQuiz);
    const positionAnswers = await convertPosition(positionAnswer);
    const width = screen[0]; // [o] => width
    const height = screen[1] + 120; // [1] => height + 120 because display computer size

    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    context.strokeStyle = "blue";
    context.lineWidth = 4;

    for (let i = 0; i < positionQuestion.leftPositions.length; i++) {
      const xStart = positionQuestion.leftPositions[i];
      const yStart = positionQuestion.topPositions[i];
      const xEnd = positionAnswers.leftPositions[i];
      const yEnd = positionAnswers.topPositions[i];

      drawLine(context, xStart, yStart, xEnd, yEnd);
    }

    const dataUrl = canvas.toDataURL();

    return res.json(dataUrl);
  } catch (err) {
    console.log("Error getting Line connect data: ", err);
    res.status(400).json({ message: "Bad Request." });
  }
};

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

// Convert Vocabularies to Value in Matching game
const convertVocabulariesToMatchingGame = async (vocabularies) => {
  try {
    const vImages = [];
    const vName = [];

    const nameRandom = shuffleArray(vocabularies);
    const imagesRandom = shuffleArray(vocabularies);

    // get images and name random
    vocabularies.forEach((_, index) => {
      vName.push({
        image: `${URL}/${nameRandom[index].img_normal}`,
        name: nameRandom[index].name,
        id: nameRandom[index].id,
      });

      vImages.push({
        image: `${URL}/${imagesRandom[index].img_normal}`,
        name: imagesRandom[index].name,
        id: imagesRandom[index].id,
      });
    });

    return [vImages, vName];
  } catch (err) {
    console.log("Error convert vocabularies", err);
  }
};

// Get Vocabularies
const getVocabularies = async (req, res) => {
  try {
    const category = req.params.category;
    const vocabularies = await getRandomVocabularies(category, 4);

    const vMatchingGame = await convertVocabulariesToMatchingGame(vocabularies);

    return res.json(vMatchingGame);
  } catch (err) {
    console.log("Error getting matting game: ", err);
    res.status(400).json({ message: "Bad Request." });
  }
};

module.exports = {
  createLineConnectBlock,
  getVocabularies,
};
