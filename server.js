const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const path = require("path");

const configDB = require("./configs/config.database.js");
const { PORT } = require("./configs/config.api.js");
const categoriesRoutes = require("./routes/categories.js");
const vocabulariesRoutes = require("./routes/vocabularies.js");
const characterRouter = require("./routes/character.js");
const gamesRouter = require("./routes/games.js");
const authenticationRouter = require("./routes/authentication.js");

const app = express();

sql.connect(configDB, (err) => {
  if (err) console.log(err);
});

app.use(cors());
app.use(express.json());

// Uploads file (img and video)
app.use("/start", (req, res) => res.json("Hello From Backend"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Education Sign Language
app.use("/categories", categoriesRoutes);
app.use("/vocabularies", vocabulariesRoutes);
app.use("/character", characterRouter);

// Games
app.use("/games", gamesRouter);

// Login and Register
app.use("/authentication", authenticationRouter);

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server is running to port: ${PORT}`);
});
