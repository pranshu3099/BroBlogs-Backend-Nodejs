const express = require("express");
const { UserRegister, UserLogin } = require("./controller/AuthController");
const {
  createPosts,
  getHomePosts,
  getUserPost,
  getSinglePost,
} = require("./controller/PostsController");
const { getCategories } = require("./controller/CategoryController");
const { addLikes, remove_like } = require("./controller/LikesController");
const { create, getComments } = require("./controller/CommentController");
const app = express();
const { z, string } = require("zod");
const { validate } = require("./middleware/validate");
const cors = require("cors");
const port = 3000;
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(cors());
}

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=])[A-Za-z\d@#$%^&+=]{6,15}$/;

const emailRegex = /^[\w.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const mobileRegex = /^\d{10}$/;

const registerSchema = z.object({
  name: string().min(5).max(20),
  password: string().min(6).max(15).regex(passwordRegex, {
    message:
      "Password must contain at least one capital letter, one digit, and one special character",
  }),
  email: string().max(20).regex(emailRegex, { message: "Invalid email" }),
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
      email: z.string().max(20).regex(emailRegex, { message: "Invalid email" }),
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
app.get("/getsinglepost/:post_id", getSinglePost);

app.get("/getCategories", getCategories);

app.post("/addLikes/:post_id/users/:user_id", addLikes);
app.post("/removeLikes/:post_id/users/:user_id", remove_like);

app.post(
  "/comment",
  validate({
    body: z.object({
      comment: z.string(2).max(10000),
    }),
  }),
  create
);

app.get("/getcomments/:post_id", getComments);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
