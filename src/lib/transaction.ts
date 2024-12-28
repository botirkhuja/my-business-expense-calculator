import { ICategory } from "@/model/Category";
import { TransactionRecord } from "@/model/Transaction";
import { Types } from "mongoose";

export function convertToTransactionType(type: string): "debit" | "credit" {
  const saleOrFeeRegex = /sale|fee/i;
  const refundRegex = /refund/i;
  if (saleOrFeeRegex.test(type)) {
    return "credit";
  }
  if (refundRegex.test(type)) {
    return "debit";
  }
  return type.toLowerCase() === "d" ? "debit" : "credit";
}

export function getTransactionCategoryId(
  transaction: TransactionRecord,
  categories: ICategory[],
): Types.ObjectId | null {
  const { description, merchant, category } = transaction;
  let categoryFromDescription: Types.ObjectId | null = null;
  let categoryFromMerchant: Types.ObjectId | null = null;
  let categoryFromRecord: Types.ObjectId | null = null;

  for (const cat of categories) {
    if (cat.regex) {
      const regex = new RegExp(cat.regex, "i");
      const catId = new Types.ObjectId(cat._id);
      if (description && regex.test(description)) {
        categoryFromDescription = catId;
      }
      if (merchant && regex.test(merchant)) {
        categoryFromMerchant = catId;
      }
      if (category && regex.test(category)) {
        categoryFromRecord = catId;
      }
    }
  }

  if (categoryFromDescription !== null) return categoryFromDescription;
  if (categoryFromMerchant !== null) return categoryFromMerchant;
  if (categoryFromRecord !== null) return categoryFromRecord;

  return null;
}
