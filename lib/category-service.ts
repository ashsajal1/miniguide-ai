"use server";

import { asc, isNull } from "drizzle-orm";
import db from "@/db/client";
import { category } from "@/db/schema";

export async function getCategories() {
  try {
    const categories = await db.query.category.findMany({
      where: isNull(category.deleted_at),
      orderBy: asc(category.name),
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
