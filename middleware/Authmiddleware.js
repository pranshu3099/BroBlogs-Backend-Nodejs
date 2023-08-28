const { z } = require("zod");
const axios = require("axios");
const AuthValidation = async (req, res, next) => {
  let userData;
  try {
    const token = req.cookies.get("github-jwt");
    if (token) {
      const user = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          accept: "application/json",
        },
      });
      userData = user.data;
    }
  } catch (err) {
    console.log(err);
    console.error("Error fetching user data from GitHub API:", err.message);
  }
  req.userData = userData;
  next();
};

module.exports = {
  AuthValidation,
};
