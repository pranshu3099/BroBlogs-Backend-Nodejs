const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getCategories = async (req, res) => {
  const allCategories = await prisma.categories.findMany();
  return res.status(200).json({ categories: allCategories });
};

module.exports = {
  getCategories,
};
