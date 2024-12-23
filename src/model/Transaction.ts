import mongoose, { Schema, Model } from "mongoose";
import { TransactionRecord } from "./TransactionRecord";

const TransactionSchema = new Schema<TransactionRecord>(
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
    memo: String,
  },
  { timestamps: true },
);

export const Transaction: Model<TransactionRecord> =
  mongoose.models.Transaction ||
  mongoose.model<TransactionRecord>("Transaction", TransactionSchema);

export default Transaction;
