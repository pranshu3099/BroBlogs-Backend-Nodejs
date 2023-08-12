const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getCategories = async (req, res) => {
  try {
    const allCategories = await prisma.categories.findMany();
    return res.status(200).json({ categories: allCategories });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
};

module.exports = {
  getCategories,
};
