import { Document } from "mongoose";

export interface TransactionRecord extends Document {
  cardNumber: string;
  postDate: Date;
  transactionDate: Date;
  refId: string;
  description: string;
  amount: string;
  merchant: string;
  transactionType: "debit" | "credit";
  category: string;
  memo: string;
}
