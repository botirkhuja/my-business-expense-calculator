"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Transaction, {
  TransactionRecord,
  transactionToJson,
} from "@/model/Transaction";
import { AnyBulkWriteOperation, Types } from "mongoose";
import { getCategories, getCategoryByKey } from "../categories/actions";
import { getTransactionRecordCategoryId } from "@/lib/transaction";
import { ICategory } from "@/model/Category";
import { revalidateTag } from "next/cache";

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
    const category = getTransactionRecordCategoryId(transaction, categories);
    if (
      !transaction.isCategoryManuallySet &&
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

  revalidateTag("/transactions");

  return;
}

export async function changeTransactionCategory(
  transactionId: string,
  categoryId: string | null,
) {
  connectToDatabase();

  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  let category: ICategory | null = null;

  if (categoryId !== null) {
    try {
      category = await getCategoryByKey(categoryId);
    } catch (error) {
      console.error(error);
      throw new Error("Category not found");
    }
  }

  if (transaction && category) {
    transaction.evaluvatedCategory = category
      ? new Types.ObjectId(category._id)
      : null;
    transaction.isCategoryManuallySet = true;
    await transaction.save();
  }

  return transactionToJson(transaction);
}

export async function deleteTransactionById(transactionId: string) {
  connectToDatabase();

  const transaction = await Transaction.findById(transactionId);
  await transaction?.deleteOne().exec();
  await Transaction.deleteOne({ _id: transactionId });
}

type TransactionToBeCreated = {
  transactionDate: Date;
  description: string;
  amount: string;
  transactionType: "debit" | "credit";
};

export async function registerNewTransaction(
  transactionToBeCreated: TransactionToBeCreated,
) {
  connectToDatabase();

  const categories = await getCategories();

  const newTransaction = createTransactionObject({
    ...transactionToBeCreated,
  });

  newTransaction.evaluvatedCategory = getTransactionRecordCategoryId(
    newTransaction,
    categories,
  );
  const transactionInstance = new Transaction(newTransaction);
  await transactionInstance.save();
  return transactionToJson(transactionInstance);
}

const createTransactionObject = (
  transaction: TransactionToBeCreated,
): Omit<TransactionRecord, "_id"> => {
  const description = transaction.description;
  const amount = transaction.amount;
  const transactionType = transaction.transactionType;

  if (description === undefined) {
    throw new Error("Description is required");
  }

  if (amount === undefined) {
    throw new Error("Amount is required");
  }

  if (transactionType === undefined) {
    throw new Error("Transaction type is required");
  }
  return {
    ...transaction,
    cardNumber: null,
    postDate: new Date(),
    transactionDate: transaction.transactionDate || new Date(),
    refId: null,
    description: transaction.description,
    normalizedDescription: transaction.description?.trim().toLowerCase(),
    amount: transaction.amount,
    merchant: null,
    normalizedMerchant: null,
    transactionType: transaction.transactionType || null,
    evaluvatedTransactionType: transactionType,
    accountType: "cash",
    category: null,
    normalizedCategory: null,
    evaluvatedCategory: null,
    isCategoryManuallySet: false,
    memo: null,
    receiptUrls: [],
  };
};
