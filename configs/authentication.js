require("dotenv").config();

module.exports = {
  secretKey: process.env.SECRET_KEY,
  hashRound: process.env.HASH_ROUND,
};
