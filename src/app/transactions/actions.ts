"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Transaction, {
  TransactionRecord,
  transactionToJson,
} from "@/model/Transaction";
import { AnyBulkWriteOperation } from "mongoose";
import { getCategories } from "../categories/actions";
import { getTransactionCategoryId } from "@/lib/transaction";

type GetTransactionsResponse = {
  transactions: TransactionRecord[];
  totalRecords: number;
};

export async function getTransactions(): Promise<GetTransactionsResponse> {
  console.log("get transactions is invoked");
  connectToDatabase();
  // Fetch data from database
  const transactions = await Transaction.find().populate(
    "evaluvatedCategory",
    "name",
  );
  const result = transactions.map(transactionToJson);

  const totalRecords = await Transaction.estimatedDocumentCount();

  return { transactions: result, totalRecords };
}

export async function recategorizeTransactions() {
  console.log("rerunning categorization");
  connectToDatabase();

  const transactions = await Transaction.find().exec();
  const categories = await getCategories();

  const updatedTransactions: AnyBulkWriteOperation<TransactionRecord>[] = [];

  for (const transaction of transactions) {
    const category = getTransactionCategoryId(transaction, categories);
    if (
      category &&
      transaction.evaluvatedCategory?._id.toString() !== category._id.toString()
    ) {
      updatedTransactions.push({
        updateOne: {
          filter: { _id: transaction._id },
          update: { evaluvatedCategory: category },
        },
      });
    }
  }

  if (updatedTransactions.length) {
    await Transaction.bulkWrite(updatedTransactions);
  }

  return transactions
    .map((transaction) => {
      return {
        ...transaction,
        _id: transaction._id,
        evaluvatedCategory: transaction.evaluvatedCategory
          ? categories.find(
              (cat) =>
                cat._id.toString() ===
                (transaction.evaluvatedCategory as never as string),
            )
          : null,
      } as never as TransactionRecord;
    })
    .map(transactionToJson);
}
