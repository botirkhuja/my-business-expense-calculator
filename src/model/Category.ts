import mongoose, { Schema, Model } from "mongoose";

// type CategoryRecord = Record<"regex" | "label" | "icon" | "key", string>;

export interface ICategory {
  _id: string;
  name: string;
  regex: string;
  icon: string;
  key: string;
  keywords: string[];
  categoryType: "expense" | "income";
  createdAt: Date;
  updatedAt: Date | null;
  isDeleted: boolean;
}

const CategorySchema = new Schema<ICategory, Model<ICategory>>(
  {
    name: { type: String, required: true },
    regex: { type: String, required: true },
    icon: { type: String, required: true },
    key: { type: String, required: true },
    keywords: { type: [String], default: [] },
    categoryType: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export const categoryToJson = (
  category: ICategory | null | undefined,
): ICategory | null => {
  if (!category) return null;

  return {
    _id: category._id.toString(),
    name: category.name,
    regex: category.regex,
    icon: category.icon,
    key: category.key,
    keywords: category.keywords,
    categoryType: category.categoryType,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    isDeleted: category.isDeleted,
  };
};
