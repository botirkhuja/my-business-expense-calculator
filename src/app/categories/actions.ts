"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Category, ICategory } from "@/model/Category";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function getCategories() {
  await connectToDatabase();

  const categories = await Category.find().lean();
  const result = categories.map((category) => {
    return {
      ...category,
      _id: category._id.toString(),
    } as ICategory;
  });

  return result;
}

const createCategorySchema = z.object({
  name: z.string({
    message: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  regex: z.string({
    message: "Regex is required",
    invalid_type_error: "Regex must be a string",
  }),
  icon: z.string({
    message: "Icon is required",
    invalid_type_error: "Icon must be a string",
  }),
  key: z.string({
    message: "Key is required",
    invalid_type_error: "Key must be a string",
  }),
});

// Create a new category and redirect to the categories page
export async function createCategory(formData: FormData) {
  console.log("form data", formData);
  const validatedFields = createCategorySchema.safeParse({
    name: formData.get("name"),
    regex: formData.get("regex"),
    icon: formData.get("icon"),
    key: formData.get("key"),
  });

  if (!validatedFields.success) {
    console.log("not validated");
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  connectToDatabase();

  const categoryObj = new Category({
    ...validatedFields.data,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: null,
  });

  await categoryObj.save();

  redirect("/categories");
}

// Update a category and redirect to the categories page
export async function updateCategory(data: Partial<ICategory>) {
  connectToDatabase();

  const category = await Category.findById(data._id);

  if (!category) {
    return {
      errors: {
        _id: "Category not found",
      },
    };
  }

  category.set(data);
  await category.save();
  return { success: true };
}
