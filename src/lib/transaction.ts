import { ICategory } from "@/model/Category";
import { TransactionRecord } from "@/model/Transaction";
import { Types } from "mongoose";

export function convertToTransactionType(
  record: TransactionRecord,
): "debit" | "credit" {
  const type = record.transactionType;

  if (!type) {
    return record.amount.startsWith("-") ? "credit" : "debit";
  }

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

export function getTextCategoryId(
  textToBeCategoried: string,
  categories: ICategory[],
): Types.ObjectId | null {
  for (const cat of categories) {
    if (cat.keywords) {
      for (const keyword of cat.keywords) {
        const normalizedTextToBeCategoried = textToBeCategoried?.toLowerCase();

        if (
          normalizedTextToBeCategoried &&
          normalizedTextToBeCategoried.includes(keyword)
        ) {
          return new Types.ObjectId(cat._id);
        }
      }
    }
  }

  return null;
}

export function getTransactionRecordCategoryId(
  record: TransactionRecord,
  categories: ICategory[],
): Types.ObjectId | null {
  let evaluvatedCategory = getTextCategoryId(
    record.normalizedDescription,
    categories,
  );

  if (record.normalizedDescription.includes("nazokat")) {
    console.dir(evaluvatedCategory?._id.toString());
    const catName = categories.find(
      (c) => c._id === (evaluvatedCategory?._id.toString() as never as string),
    )?.name;
    console.dir(`${record.normalizedDescription}, ${catName}`, {
      colors: true,
    });
  }

  if (!evaluvatedCategory && record.normalizedMerchant) {
    evaluvatedCategory = getTextCategoryId(
      record.normalizedMerchant,
      categories,
    );
  }

  if (!evaluvatedCategory && record.normalizedCategory) {
    evaluvatedCategory = getTextCategoryId(
      record.normalizedCategory,
      categories,
    );
  }

  // console.log("recategorization", record.description);

  return evaluvatedCategory;
}
