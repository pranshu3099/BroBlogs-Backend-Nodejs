const { PrismaClient } = require("@prisma/client");
const { signupValidation } = require("../middleware/Authmiddleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = new PrismaClient();

const UserRegister = async (req, res) => {
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
  return res.status(200).send("user created successfully");
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
      .json({ message: "Login successful", Authorization: token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  UserRegister,
  UserLogin,
};
