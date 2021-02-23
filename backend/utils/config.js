require("dotenv").config();

const { MONGODB_URL } = process.env;

const { SECRET } = process.env;

module.exports = {
  MONGODB_URL,
  SECRET,
};
