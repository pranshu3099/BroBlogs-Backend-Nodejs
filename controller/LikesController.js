const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const updatepostLikes = async (post_id) => {
  const count = await prisma.likes.count({
    where: {
      post_id: Number(post_id),
    },
  });

  const upadteLike = await prisma.posts.update({
    where: {
      posts_id: Number(post_id),
    },
    data: {
      likes_count: count,
    },
  });
};

const addLikes = async (req, res) => {
  const { post_id, user_id } = req.params;
  const hasLiked = await prisma.likes.findFirst({
    where: {
      post_id: Number(post_id),
      user_id: Number(user_id),
    },
  });

  if (!hasLiked) {
    const like = await prisma.likes.create({
      data: {
        post_id: Number(post_id),
        user_id: Number(user_id),
      },
    });

    updatepostLikes(post_id);

    res.status(200).send("liked successfullly");
  } else {
    res.send("already liked");
  }
};

const remove_like = async (req, res) => {
  const { post_id, user_id } = req.params;
  const delete_like = await prisma.likes.deleteMany({
    where: {
      post_id: Number(post_id),
      user_id: Number(user_id),
    },
  });
  updatepostLikes(post_id);
  res.send("like removed");
};

module.exports = {
  addLikes,
  remove_like,
};
