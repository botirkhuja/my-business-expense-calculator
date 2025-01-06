"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Readable } from "stream";
import { parse } from "csv-parse";
import Transaction, {
  TransactionHeaderMap,
  TransactionRecord,
} from "@/model/Transaction";
import {
  convertToTransactionType,
  getTransactionRecordCategoryId,
} from "@/lib/transaction";
import { getCategories } from "../categories/actions";
import { redirect } from "next/navigation";

export async function uploadFile(formData: FormData) {
  try {
    // const formData = await req.formData();
    const file = formData.get("csvFile") as File;
    const transactionsAccountType = formData.get("transactionsAccountType") as
      | "credit"
      | "checking";

    // Connect to MongoDB
    await connectToDatabase();
    const categories = await getCategories();

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);

    const parser = readable.pipe(
      parse({
        columns: (header: string[]) =>
          header.map((h) => TransactionHeaderMap[h.trim()]),
        trim: true,
        delimiter: ",",
        skipEmptyLines: true,
      }),
    );

    const paymentTypeRegex = /payment|Payment/gi;
    const transactions: TransactionRecord[] = [];
    for await (const parserItem of parser) {
      const record: TransactionRecord = {
        ...parserItem,
        normalizedDescription: parserItem.description.toLowerCase(),
        normalizedCategory: parserItem.category?.toLowerCase() || null,
        normalizedMerchant: parserItem.merchant?.toLowerCase() || null,
      };

      const isNegativeRegex = /-\d/g;
      const paymentTypeKeywords = [
        "credit crd des",
        "crd",
        "scheduled payment",
      ];

      const evaluvatedTransactionType = convertToTransactionType(record);

      if (
        transactionsAccountType === "credit" &&
        record.transactionType &&
        paymentTypeRegex.test(record.transactionType)
      ) {
        continue;
      }

      if (
        paymentTypeKeywords.some((keyword) =>
          record.normalizedDescription.includes(keyword),
        )
      ) {
        continue;
      }

      if (!record.amount) {
        console.error("amount not found", record);
        throw new Error("Amount not found");
      }

      if (!record.description) {
        console.error("description not found", record);
        throw new Error("Description not found");
      }

      if (isNegativeRegex.test(record.amount)) {
        record.amount = record.amount.replace("-", "");
      }
      if (record.amount.startsWith("-")) {
        record.amount = record.amount.replace("-", "");
      }

      if (transactionsAccountType === "checking") {
        record.postDate = record.transactionDate;
      }

      const evaluvatedCategory = getTransactionRecordCategoryId(
        record,
        categories,
      );

      transactions.push({
        ...record,
        evaluvatedTransactionType,
        accountType: transactionsAccountType,
        evaluvatedCategory,
      });
    }

    if (transactions.length > 0) {
      // console.log("Transactions:", transactions);
      await Transaction.insertMany(transactions);
    }
  } catch (error) {
    console.error("File upload error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "File upload error" };
  }
  redirect("/transactions");
}
