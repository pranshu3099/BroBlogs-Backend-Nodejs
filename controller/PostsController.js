const { PrismaClient } = require("@prisma/client");
const marked = require("marked");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs/promises");
const prisma = new PrismaClient();
const { createClient } = require("@supabase/supabase-js");
async function uploadImageToSupabase(imageFilename, extension) {
  console.log(imageFilename);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  const buffer = await fs.readFile(`/home/pranshu/Downloads/${imageFilename}`);
  const { data, error } = await supabase.storage
    .from("images")
    .upload(`broblogsimages/${imageFilename}`, buffer, {
      contentType: `image/${extension}`,
      cacheControl: "15780000", //6 months
    });
  if (error) {
    console.log("error", error);
  } else {
    data.path = `${process.env.SUPABASE_URL_PREFIX}/${data.path}`;
    return data;
  }
}

async function processMarkdownAndInsertImageUrls(content) {
  const parsedHtml = marked(content);
  const $ = cheerio.load(parsedHtml);

  const updatedHtml = $.html();
  return updatedHtml;
}

const getExtension = (img) => {
  const parts = img.split(".");
  const extension = parts[parts.length - 1];
  return extension;
};

const uploadImage = async (req, res, next) => {
  try {
    const { body } = req;

    const selectedImages = body.images;
    let uploadedImages = [];
    if (Array.isArray(selectedImages)) {
      for (let i = 0; i < selectedImages.length; i++) {
        let extension = getExtension(selectedImages[i]);
        await uploadImageToSupabase(selectedImages[i], extension)
          .then((data) => {
            uploadedImages.push(data);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      await uploadImageToSupabase(selectedImages).then((data) => {
        uploadedImages.push(data);
      });
    }
    return res.status(200).json({ url: uploadedImages });
  } catch (err) {
    console.log(err);
  }
};

function removeOuterHTMLTags(htmlContent) {
  const bodyStartIndex = htmlContent.indexOf("<body>");
  const bodyEndIndex = htmlContent.indexOf("</body>");
  if (bodyStartIndex !== -1 && bodyEndIndex !== -1) {
    return htmlContent.substring(bodyStartIndex + 6, bodyEndIndex);
  }
  return htmlContent; // If no <body> tags are found, return the original content
}

const createPosts = async (req, res, next) => {
  const {
    title,
    content,
    category_id,
    posts_id,
    user_id,
    likes_count = 0,
  } = req.body;
  const { authorization } = req.headers;
  try {
    if (authorization) {
      let result;
      await processMarkdownAndInsertImageUrls(content)
        .then((updatedHtml) => {
          result = updatedHtml;
        })
        .catch((error) => {
          console.log(error);
        });
      let htmlContent = removeOuterHTMLTags(result);
      const post = await prisma.posts.create({
        data: {
          title,
          content,
          category_id,
          posts_id,
          user_id,
          likes_count,
          parsed_content: htmlContent,
        },
      });
      return res.status(200).json({ message: "post created successfully" });
    } else {
      return res.status(401).json({ message: "unauthorized" });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getHomePosts = async (req, res) => {
  try {
    const results = await prisma.posts.findMany({
      select: {
        title: true,
        category_id: true,
        posts_id: true,
        parsed_content: true,
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
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getUserPost = async (req, res) => {
  const { user_id } = req.params;
  const { authorization } = req.headers;
  try {
    if (authorization) {
      const user_posts = await prisma.posts.findMany({
        where: {
          user_id: Number(user_id),
        },
        select: {
          title: true,
          category_id: true,
          posts_id: true,
          parsed_content: true,
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
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getSinglePost = async (req, res) => {
  const { post_id } = req.params;
  const { authorization } = req.headers;

  try {
    if (authorization) {
      const single_posts = await prisma.posts.findFirst({
        where: {
          posts_id: Number(post_id),
        },
        select: {
          title: true,
          category_id: true,
          posts_id: true,
          parsed_content: true,
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
      return res.status(200).json([{ posts: single_posts }]);
    } else {
      return res.status(401).json({ message: "unauthorized" });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports = {
  createPosts,
  getHomePosts,
  getUserPost,
  getSinglePost,
  uploadImage,
};
