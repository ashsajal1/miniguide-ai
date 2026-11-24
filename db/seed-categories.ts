import db from "./client";
import { category } from "./schema";

async function main() {
  // Create default categories
  const categories = [
    { name: "Programming", description: "Learn programming languages and concepts" },
    { name: "Web Development", description: "Build websites and web applications" },
    { name: "Data Science", description: "Analyze data and build machine learning models" },
    { name: "Mobile Development", description: "Create mobile apps for iOS and Android" },
    { name: "DevOps", description: "Learn deployment, CI/CD, and infrastructure" },
    { name: "Design", description: "UI/UX design and graphic design principles" },
    { name: "Business", description: "Business skills and entrepreneurship" },
    { name: "Marketing", description: "Digital marketing and growth strategies" },
  ];

  for (const item of categories) {
    await db
      .insert(category)
      .values(item)
      .onConflictDoUpdate({
        target: category.name,
        set: { description: item.description, updated_at: new Date() },
      });
  }

  console.log("Categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
