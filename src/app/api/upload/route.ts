import { NextResponse, NextRequest } from "next/server";
import { parse } from "csv-parse";
import {
  Transaction,
  TransactionHeaderMap,
  TransactionRecord,
} from "@/model/Transaction";
import { Readable } from "stream";
import { connectToDatabase } from "@/lib/mongodb";
import {
  convertToTransactionType,
  getTransactionCategoryId,
} from "@/lib/transaction";
import { getCategories } from "@/app/categories/actions";

// Disable body parsing to handle file streams
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

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
    for await (const record of parser) {
      // Skip the record with payment type
      if (paymentTypeRegex.test(record.transactionType)) {
        continue;
      }

      const transactionType = convertToTransactionType(record.transactionType);
      const isNegativeRegex = /-\d/g;

      if (isNegativeRegex.test(record.amount)) {
        record.amount = record.amount.replace("-", "");
      }

      transactions.push({
        ...record,
        category: record.category || "uncategorized",
        normalizedCategory: record.category?.toLowerCase() || "uncategorized",
        evaluvatedCategory: getTransactionCategoryId(record, categories),
        normalizedDescription: record.description?.toLowerCase() || null,
        normalizedMerchant: record.merchant?.toLowerCase() || null,
        transactionType,
      });
    }

    if (transactions.length > 0) {
      // console.log("Transactions:", transactions);
      await Transaction.insertMany(transactions);
    }

    return NextResponse.json({ message: "File uploaded successfully!" });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
