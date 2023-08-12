const express = require("express");
const {
  UserRegister,
  UserLogin,
  githuboauthHandler,
} = require("./controller/AuthController");
const {
  createPosts,
  getHomePosts,
  getUserPost,
  getSinglePost,
  uploadImage,
} = require("./controller/PostsController");
const { getCategories } = require("./controller/CategoryController");
const { addLikes, remove_like } = require("./controller/LikesController");
const { create, getComments } = require("./controller/CommentController");
const app = express();
const { z, string } = require("zod");
const { validate } = require("./middleware/validate");
const { AuthValidation } = require("./middleware/Authmiddleware");
const multer = require("multer");
const upload = multer({ dest: "/home/pranshu/Bro_blogs_backend/uploads/" });
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();
const Cookies = require("cookies");
const port = 3000;
app.use(express.json());
app.use(Cookies.express([""]));

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:3001",
      credentials: true,
    })
  );
}

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=])[A-Za-z\d@#$%^&+=]{6,15}$/;

const emailRegex = /^[\w.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const mobileRegex = /^\d{10}$/;

const registerSchema = z.object({
  name: string().min(5).max(100),
  password: string().min(6).max(15).regex(passwordRegex, {
    message:
      "Password must contain at least one capital letter, one digit, and one special character",
  }),
  email: string().max(100).regex(emailRegex, { message: "Invalid email" }),
  mobile_number: string()
    .min(10)
    .max(10)
    .regex(mobileRegex, { message: "Inavalid mobile number" }),
});

app.post(
  "/register",
  validate({
    body: registerSchema,
  }),
  UserRegister
);
app.post(
  "/login",
  validate({
    body: z.object({
      email: z
        .string()
        .max(100)
        .regex(emailRegex, { message: "Invalid email" }),
      password: z.string().min(6).max(15).regex(passwordRegex, {
        message:
          "Password must contain at least one capital letter, one digit, and one special character",
      }),
    }),
  }),
  UserLogin
);

app.post(
  "/createposts",
  validate({
    body: z.object({
      title: z.string().min(5).max(50),
      content: z.string().min(10).max(10000),
    }),
  }),
  createPosts
);

app.get("/getposts", getHomePosts);
app.get("/uerPosts/:user_id", getUserPost);
app.get("/getsinglepost/:post_id", AuthValidation, getSinglePost);

app.get("/getCategories", getCategories);

app.post("/addLikes/:post_id/users/:user_id", AuthValidation, addLikes);
app.post("/removeLikes/:post_id/users/:user_id", AuthValidation, remove_like);

app.post(
  "/comment",
  validate({
    body: z.object({
      comment: z.string(2).max(10000),
    }),
  }),
  AuthValidation,
  create
);

app.post("/api/uploadimage", upload.array("images"), uploadImage);

app.get("/getcomments/:post_id", getComments);

app.get("/api/auth/github", githuboauthHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
