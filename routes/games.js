const express = require("express");
const router = express.Router();
const QuizGame = require("../controllers/games/quizGameController.js");
const SpellingGame = require("../controllers/games/spellingGameController.js");
const MatchingGame = require("../controllers/games/matchingGameController.js");
const DifferenceGame = require("../controllers/games/differenceGameController.js");
const Simulation = require("../controllers/games/simulationGameController.js");

// Quiz Game
router.get("/quiz/:category", QuizGame.getRandomQuestion);

// Spelling Game
router.get("/spelling/:category", SpellingGame.getSpellingCharacter);

// Matching Game
router.post("/matching", MatchingGame.createLineConnectBlock);
router.get("/matching/:category", MatchingGame.getVocabularies);

// Difference Game
router.get(
  "/difference/:category",
  DifferenceGame.getVocabulariesDifferenceGame
);

// Simulation Game
router.get("/simulation", Simulation.getQuestionSimulationGame);

module.exports = router;
