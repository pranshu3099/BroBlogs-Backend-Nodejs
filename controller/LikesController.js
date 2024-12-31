const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const updatepostLikes = async (post_id) => {
  try {
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
    return count;
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
};

const isPostLiked = async (req, res) => {
  try {
    const { post_id, user_id } = req.params;
    const userData = req.userData;
    if (userData) {
      const hasLiked = await prisma.likes.findFirst({
        where: {
          post_id: Number(post_id),
          user_id: Number(user_id),
        },
      });

      if (hasLiked) {
        return res.status(200).json({ has_liked: true });
      } else {
        return res.status(200).json({ has_liked: false });
      }
    }
  } catch (err) {}
};

const addLikes = async (req, res) => {
  try {
    const { post_id, user_id } = req.params;
    const userData = req.userData;
    if (userData) {
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

        let count;
        await updatepostLikes(post_id).then((res) => (count = res));
        return res.status(200).json({ likes: count });
      } else {
        return res.status(200).json({ message: "already liked" });
      }
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

const remove_like = async (req, res) => {
  try {
    const { post_id, user_id } = req.params;
    const userData = req.userData;
    if (userData) {
      const delete_like = await prisma.likes.deleteMany({
        where: {
          post_id: Number(post_id),
          user_id: Number(user_id),
        },
      });
      let count;
      await updatepostLikes(post_id).then((res) => (count = res));
      return res.status(200).json({ likes: count });
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

module.exports = {
  addLikes,
  remove_like,
  isPostLiked,
};
