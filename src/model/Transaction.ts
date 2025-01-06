import mongoose, { Schema, Model, Types } from "mongoose";
import { Category, categoryToJson, ICategory } from "./Category";

export const TransactionHeaderMap: Record<string, string> = {
  "Transaction Date": "transactionDate",
  "Trans. Date": "transactionDate",
  Date: "transactionDate",
  "Post Date": "postDate",
  "Posting Date": "postDate",
  Card: "cardNumber",
  "Account/Card Number - last 4 digits": "cardNumber",
  Description: "description",
  Amount: "amount",
  Type: "transactionType",
  "Transaction Type": "transactionType",
  Memo: "memo",
  Category: "category",
  "Expense Category": "category",
  "Merchant Category": "merchant",
  "Reference ID": "refId",
};

export interface TransactionRecord {
  _id: string;
  cardNumber: string | null;
  postDate: Date;
  transactionDate: Date;
  refId: string;
  description: string;
  normalizedDescription: string;
  amount: string;
  merchant: string | null;
  normalizedMerchant: string | null;
  transactionType: string | null;
  evaluvatedTransactionType: "debit" | "credit";
  accountType: "checking" | "credit" | "savings";
  category: string | null;
  normalizedCategory: string | null;
  evaluvatedCategory: Types.ObjectId | ICategory | null;
  isCategoryManuallySet?: boolean;
  memo: string;
}

const TransactionSchema = new Schema<
  TransactionRecord,
  Model<TransactionRecord>
>(
  {
    cardNumber: { type: String || null, default: null },
    postDate: { type: Date, required: true },
    transactionDate: { type: Date, required: true },
    refId: String,
    description: { type: String, required: true },
    normalizedDescription: String,
    amount: { type: String, required: true },
    merchant: String || null,
    normalizedMerchant: String || null,
    transactionType: {
      type: String || null,
      default: null,
    },
    evaluvatedTransactionType: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    accountType: {
      type: String,
      enum: ["checking", "credit", "savings"],
      required: true,
    },
    category: { type: String, default: null },
    normalizedCategory: { type: String, default: null },
    evaluvatedCategory: {
      type: Schema.Types.ObjectId || null,
      ref: Category,
      default: null,
    },
    isCategoryManuallySet: { type: Boolean, default: false },
    memo: String,
  },
  { timestamps: true },
);

export const Transaction: Model<TransactionRecord> =
  mongoose.models.Transaction ||
  mongoose.model<TransactionRecord>("Transaction", TransactionSchema);

export default Transaction;

export const transactionToJson = (
  transactionRecord: TransactionRecord,
): TransactionRecord => {
  const transaction = {
    cardNumber: transactionRecord.cardNumber,
    postDate: transactionRecord.postDate,
    transactionDate: transactionRecord.transactionDate,
    refId: transactionRecord.refId,
    description: transactionRecord.description,
    normalizedDescription: transactionRecord.normalizedDescription,
    amount: transactionRecord.amount,
    merchant: transactionRecord.merchant,
    normalizedMerchant: transactionRecord.normalizedMerchant,
    transactionType: transactionRecord.transactionType,
    evaluvatedTransactionType: transactionRecord.evaluvatedTransactionType,
    accountType: transactionRecord.accountType,
    category: transactionRecord.category,
    normalizedCategory: transactionRecord.normalizedCategory,
    evaluvatedCategory: categoryToJson(
      transactionRecord.evaluvatedCategory as ICategory,
    ),
    isCategoryManuallySet: transactionRecord.isCategoryManuallySet,
    memo: transactionRecord.memo,
    _id: transactionRecord._id.toString(),
  };
  return transaction;
};
