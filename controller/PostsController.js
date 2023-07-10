const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPosts = async (req, res, next) => {
  const { title, content, category_id, posts_id, user_id, Authorization } =
    req.body;
  if (Authorization) {
    const post = await prisma.posts.create({
      data: {
        title,
        content,
        category_id,
        posts_id,
        user_id,
      },
    });
    return res.status(200).send("post created successfully");
  } else {
    return res.status(401).json({ message: "unauthorizedx" });
  }
};

const getHomePosts = async (req, res) => {
  const results = await prisma.posts.findMany({
    select: {
      title: true,
      category_id: true,
      posts_id: true,
      content: true,
      likes_count: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
  console.log(results);
};

const getUserPost = async (req, res) => {
  const { Authorization, user_id } = req.params;
  if (Authorization) {
    const user_posts = await prisma.posts.findMany({
      where: {
        user_id: Number(user_id),
      },
      select: {
        title: true,
        category_id: true,
        posts_id: true,
        content: true,
        likes_count: true,
        user: {
          select: {
            name: true,
          },
        },
        comments: {
          select: {
            comment: true,
            user_id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(JSON.stringify(user_posts, null, 2));
  } else {
    return res.status(401).json({ message: "unauthorized" });
  }
};

const getSinglePost = async (req, res) => {
  const { Authorization, post_id } = req.params;
  if (Authorization) {
    const single_posts = await prisma.posts.findFirst({
      where: {
        posts_id: Number(post_id),
      },
      select: {
        title: true,
        category_id: true,
        posts_id: true,
        content: true,
        likes_count: true,
        user: {
          select: {
            name: true,
          },
        },
        comments: {
          select: {
            comment: true,
            user_id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    console.log(JSON.stringify(single_posts, null, 2));
  }
};

module.exports = {
  createPosts,
  getHomePosts,
  getUserPost,
  getSinglePost,
};
