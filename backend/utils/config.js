require("dotenv").config();

const { MONGODB_URL, JWT_SECRET, SALT_ROUNDS } = process.env;

// const { JWT_SECRET } = process.env;

module.exports = {
  MONGODB_URL,
  JWT_SECRET,
  SALT_ROUNDS,
};
