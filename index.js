const express = require("express");
const {
  UserRegister,
  UserLogin,
  githuboauthHandler,
  ChecktokenValidity,
} = require("./controller/AuthController");
const {
  createPosts,
  getHomePosts,
  getUserPost,
  getSinglePost,
  uploadImage,
} = require("./controller/PostsController");
const { getCategories } = require("./controller/CategoryController");
const {
  addLikes,
  remove_like,
  isPostLiked,
} = require("./controller/LikesController");
const { create, getComments } = require("./controller/CommentController");
const app = express();
const { z, string } = require("zod");
const { validate } = require("./middleware/validate");
const { AuthValidation } = require("./middleware/Authmiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();
const Cookies = require("cookies");
const port = process.env.PORT;
app.use(express.json());
app.use(Cookies.express([""]));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

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
app.get("/userPosts/:user_id", getUserPost);
app.get("/getsinglepost/:post_title", AuthValidation, getSinglePost);

app.get("/getCategories", getCategories);

app.post("/addLikes/:post_id/users/:user_id", AuthValidation, addLikes);
app.post("/removeLikes/:post_id/users/:user_id", AuthValidation, remove_like);
app.get("/ispostLiked/:post_id/users/:user_id", AuthValidation, isPostLiked);

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

app.get("/tokenvalid", AuthValidation, ChecktokenValidity);

app.listen(port, () => {
  console.log(`BroBlogs listening on port ${port}`);
});
