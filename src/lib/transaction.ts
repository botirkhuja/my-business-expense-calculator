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

  for (const cat of categories) {
    if (cat.keywords) {
      for (const keyword of cat.keywords) {
        const normalizedDescription = description?.toLowerCase();
        const normalizedMerchant = merchant?.toLowerCase();
        const normalizedCategory = category?.toLowerCase();

        if (normalizedDescription && normalizedDescription.includes(keyword)) {
          return new Types.ObjectId(cat._id);
        }

        if (normalizedMerchant && normalizedMerchant.includes(keyword)) {
          return new Types.ObjectId(cat._id);
        }

        if (normalizedCategory && normalizedCategory.includes(keyword)) {
          return new Types.ObjectId(cat._id);
        }
      }
    }
  }

  return null;
}
