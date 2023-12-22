require("dotenv").config();

module.exports = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  trustServerCertificate: true,
  options: {
    encrypt: true,
    connectionTimeout: 15000,
    requestTimeout: 15000,
  },
};
