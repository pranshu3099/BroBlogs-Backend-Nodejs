const { PrismaClient } = require("@prisma/client");
const { response } = require("express");
const prisma = new PrismaClient();

const create = async (req, res) => {
  const userData = req.userData;
  try {
    if (userData) {
      const { posts_id, user_id, comment } = req.body;
      const createcomment = await prisma.comments.create({
        data: {
          posts_id: posts_id,
          user_id: user_id,
          comment,
        },
      });

      return res.status(200).json({ message: "commented successfully" });
    } else {
      return res.status(401).json([{ message: "unauthorized" }]);
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
};

const getComments = async (req, res) => {
  try {
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
    return res.status(200).json(user_comments);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
};

module.exports = {
  create,
  getComments,
};
