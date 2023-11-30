const sql = require("mssql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authenticationKey = require("../configs/authentication.js");

const secretKey = authenticationKey.secretKey;
const hashRound = 10;

const registerController = async (req, res) => {
  try {
    const { username, password } = req.body;

    bcrypt.hash(password, hashRound, async (err, hashPassword) => {
      if (err) {
        res.status(500).json({ error: "Error hashing password" });
        return;
      }

      const request = new sql.Request();

      const query = `INSERT INTO admin_account (username, password) VALUES ('${username}', '${hashPassword}')`;
      await request.query(query);

      return res.json({ massage: "register success" });
    });
  } catch (err) {
    console.error("Error registering account:", error);
    return res.status(400).json({ message: "Bad Request." });
  }
};

const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;

    const request = new sql.Request();

    const query = `SELECT * FROM admin_account WHERE username = '${username}'`;
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.recordset[0];

    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

      return res.json({ status: "ok", token: token, expiresIn: "1-hour" });
    });
  } catch (err) {
    console.error("Error logging in:", err);
    return res.status(400).json({ message: "Bad Request." });
  }
};

const verifyAccountController = async (req, res) => {
  try {
    const accessToken = req.params.token;

    const decoded = jwt.verify(accessToken, secretKey);
    const username = decoded.username;

    const request = new sql.Request();

    const query = `SELECT * FROM admin_account WHERE username = '${username}'`;
    const result = await request.query(query);

    if (result.recordset.length !== 0) {
      const usernameDB = result.recordset[0].username;

      if (usernameDB === username) {
        return res.json(true);
      }
    }
  } catch (err) {
    console.error("Error verify account:", err);
    return res.status(400).json({ message: "Bad Request." });
  }
};

module.exports = {
  loginController,
  registerController,
  verifyAccountController,
};
