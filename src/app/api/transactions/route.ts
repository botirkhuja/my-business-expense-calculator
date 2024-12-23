import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/model/Transaction"; // your Mongoose model

export async function GET() {
  await connectToDatabase(); // ensure a working connection helper
  const transactions = await Transaction.find().lean();
  return NextResponse.json(transactions);
}
