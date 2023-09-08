const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  try {
    const categoriesToSeed = [
      { category_name: "Web Development", slug: 234 },
      { category_name: "Artificial Intelligence", slug: 19 },
      { category_name: "Machine Learning", slug: 1312 },
      { category_name: "Self Invention", slug: 199 },
      { category_name: "Self Programming Language", slug: 1612 },
      // Add more objects as needed
    ];

    // Loop through the array and create each category
    for (const categoryData of categoriesToSeed) {
      await prisma.category.create({
        data: categoryData,
      });
    }

    console.log("Categories seeded successfully.");
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
