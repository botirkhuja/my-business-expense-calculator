import { NextResponse, NextRequest } from "next/server";
import { parse } from "csv-parse";
import { Transaction } from "@/model/Transaction";
import { Readable } from "stream";
import { connectToDatabase } from "@/lib/mongodb";
import { convertToTransactionType } from "@/lib/transaction";
import { TransactionRecord } from "@/model/TransactionRecord";

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

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);

    // Map headers if present
    const headerMap: Record<string, string> = {
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

    const parser = readable.pipe(
      parse({
        columns: (header: string[]) => header.map((h) => headerMap[h.trim()]),
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

      if (transactionType === "debit" && isNegativeRegex.test(record.amount)) {
        record.amount = record.amount.replace("-", "");
      }

      if (
        transactionType === "credit" &&
        !isNegativeRegex.test(record.amount)
      ) {
        record.amount = `-${record.amount}`;
      }

      transactions.push({
        ...record,
        category: record.category || "Uncategorized",
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
