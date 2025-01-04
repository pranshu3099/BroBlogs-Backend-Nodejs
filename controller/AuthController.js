const { PrismaClient } = require("@prisma/client");
const { signupValidation } = require("../middleware/Authmiddleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const qs = require("qs");
const querystring = require("querystring");
const prisma = new PrismaClient();
const secret = "xyz@34#";
const UserRegister = async (req, res) => {
  try {
    const obj = req.body;
    const user_password = await bcrypt.hash(obj.password, 10);
    const user = await prisma.users.create({
      data: {
        email: obj.email,
        name: obj.name,
        mobile_number: obj.mobile_number,
        password: user_password,
      },
    });
    return res.status(200).json({ message: "user created successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
};

const UserLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.users.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const hashedPassword = user.password;
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const secretKey = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign(user, secretKey, {
      expiresIn: "12h",
    });
    return res
      .status(200)
      .json({ message: "Login successful", Authorization: token, user: user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getGithubUser = async (code) => {
  try {
    const githubtoken = await axios
      .post(
        `https://github.com/login/oauth/access_token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET_ID}&code=${code}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      )
      .then((res) => res.data)
      .catch((error) => {
        console.log(error);
      });

    const decoded = querystring.parse(githubtoken);
    const access_token = decoded.access_token;
    const github_user = await axios
      .get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Production server Blog",
        },
      })
      .then((res) => res.data);

    return { github_user, access_token };
  } catch (error) {
    console.error("GitHub OAuth Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

const githuboauthHandler = async (req, res, next) => {
  try {
    const code = req.query.code;
    const path = req.query.path || "";
    if (!code) {
      throw new Error("code not found");
    }
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET_ID) {
      console.error("Missing required environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    } else {
      const { github_user, access_token } = await getGithubUser(code);
      console.log(github_user);
      if (!github_user.email) {
        return res.status(400).json({ message: "GitHub email is required" });
      }
      let user = await prisma.users.findFirst({
        where: {
          email: github_user.email,
        },
      });
      if (!user) {
        user = await prisma.users.create({
          data: {
            email: github_user.email,
            name: github_user.name || github_user.login,
            password: github_user.password ? github_user.password : "",
            mobile_number: github_user.mobile_number
              ? github_user.mobile_number
              : null,
          },
        });
      }
      const querystring = encodeURIComponent(JSON.stringify(user));
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      res.cookies.set("github-jwt", access_token, {
        httpOnly: true,
        maxAge: 15552000 * 1000,
      });
      res
        .status(303)
        .redirect(`${process.env.FRONTEND_URL}/${path}?data=${querystring}`);
    }
  } catch (err) {
    console.error("OAuth Handler Error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
};

const ChecktokenValidity = async (req, res, next) => {
  let userData = req.userData;
  if (userData) {
    let user = await prisma.users.findFirst({
      where: {
        email: userData.email,
      },
    });
    return res.status(200).json([{ message: "success", user: user }]);
  } else {
    return res.status(401).json([{ message: "unauthorized" }]);
  }
};

module.exports = {
  UserRegister,
  UserLogin,
  githuboauthHandler,
  ChecktokenValidity,
};
