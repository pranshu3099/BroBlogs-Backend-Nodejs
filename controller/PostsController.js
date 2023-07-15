const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPosts = async (req, res, next) => {
  const {
    title,
    content,
    category_id,
    posts_id,
    user_id,
    image,
    likes_count = 0,
  } = req.body;
  const { authorization } = req.headers;
  if (authorization) {
    const post = await prisma.posts.create({
      data: {
        title,
        content,
        image,
        category_id,
        posts_id,
        user_id,
        likes_count,
      },
    });
    return res.status(200).json({ message: "post created successfully" });
  } else {
    return res.status(401).json({ message: "unauthorized" });
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
      created_at: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
  res.status(200).json([{ posts: results }]);
};

const getUserPost = async (req, res) => {
  const { user_id } = req.params;
  const { authorization } = req.headers;
  if (authorization) {
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
        created_at: true,
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

    return res.status(200).json({ posts: user_posts });
  } else {
    return res.status(401).json({ message: "unauthorized" });
  }
};

const getSinglePost = async (req, res) => {
  const { post_id } = req.params;
  const { authorization } = req.headers;

  if (authorization) {
    const single_posts = await prisma.posts.findFirst({
      where: {
        posts_id: Number(post_id),
      },
      select: {
        title: true,
        category_id: true,
        posts_id: true,
        content: true,
        image: true,
        likes_count: true,
        created_at: true,
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
    const data = { ...single_posts, image: single_posts.image || "" };
    return res.status(200).json([{ posts: data }]);
  }
};

module.exports = {
  createPosts,
  getHomePosts,
  getUserPost,
  getSinglePost,
};
