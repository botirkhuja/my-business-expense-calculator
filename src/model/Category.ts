import mongoose, { Schema, Document, Model } from "mongoose";

// type CategoryRecord = Record<"regex" | "label" | "icon" | "key", string>;

export interface ICategory extends Document<string> {
  name: string;
  regex: string;
  icon: string;
  key: string;
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
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export const categoryToJson = (category: ICategory | null | undefined) => {
  if (!category) return null;

  return {
    _id: category._id.toString(),
    name: category.name,
    regex: category.regex,
    icon: category.icon,
    key: category.key,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    isDeleted: category.isDeleted,
  };
};
