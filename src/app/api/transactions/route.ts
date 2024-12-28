import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/model/Transaction"; // your Mongoose model

export async function GET() {
  console.log("get is invoked");
  await connectToDatabase(); // ensure a working connection helper
  const transactions = await Transaction.find()
    .lean()
    .populate("evaluvatedCategory", "name")
    .exec();

  return NextResponse.json(transactions);
}
