const { PrismaClient } = require("@prisma/client");
const { response } = require("express");
const prisma = new PrismaClient();

const create = async (req, res) => {
  const { posts_id, user_id, comment } = req.body;
  const createcomment = await prisma.comments.create({
    data: {
      posts_id: posts_id,
      user_id: user_id,
      comment,
    },
  });

  return res.send("commented successfully");
};

const getComments = async (req, res) => {
  const { post_id } = req.params;
  const user_comments = await prisma.comments.findMany({
    where: {
      posts_id: Number(post_id),
    },
    select: {
      comment: true,
      user_id: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
  return res.status(200).json({ comments: user_comments });
};

console.log("hey");
module.exports = {
  create,
  getComments,
};
