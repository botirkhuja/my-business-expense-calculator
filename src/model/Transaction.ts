import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { Category, categoryToJson, ICategory } from "./Category";

export const TransactionHeaderMap: Record<string, string> = {
  "Transaction Date": "transactionDate",
  "Trans. Date": "transactionDate",
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

export interface TransactionRecord extends Document<string> {
  cardNumber: string;
  postDate: Date;
  transactionDate: Date;
  refId: string;
  description: string;
  amount: string;
  merchant: string;
  transactionType: "debit" | "credit";
  category: string;
  evaluvatedCategory: Types.ObjectId | ICategory | null;
  memo: string;
}

const TransactionSchema = new Schema<
  TransactionRecord,
  Model<TransactionRecord>
>(
  {
    cardNumber: { type: String, required: true },
    postDate: { type: Date, required: true },
    transactionDate: { type: Date, required: true },
    refId: String,
    description: String,
    // Amount is stored as a string to avoid floating point errors
    amount: { type: String, required: true },
    merchant: String,
    transactionType: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    category: { type: String, required: true },
    evaluvatedCategory: {
      type: Schema.Types.ObjectId || null,
      ref: Category,
    },
    memo: String,
  },
  { timestamps: true },
);

export const Transaction: Model<TransactionRecord> =
  mongoose.models.Transaction ||
  mongoose.model<TransactionRecord>("Transaction", TransactionSchema);

export default Transaction;

export const transactionToJson = (transactionRecord: TransactionRecord) => {
  const transaction = {
    cardNumber: transactionRecord.cardNumber,
    postDate: transactionRecord.postDate,
    transactionDate: transactionRecord.transactionDate,
    refId: transactionRecord.refId,
    description: transactionRecord.description,
    amount: transactionRecord.amount,
    merchant: transactionRecord.merchant,
    transactionType: transactionRecord.transactionType,
    category: transactionRecord.category,
    evaluvatedCategory: categoryToJson(
      transactionRecord.evaluvatedCategory as ICategory,
    ),
    memo: transactionRecord.memo,
    _id: transactionRecord._id.toString(),
  };
  return transaction as TransactionRecord;
};
