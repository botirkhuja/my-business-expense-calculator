// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { connectToDatabase } from "@/lib/mongodb";
import { Transaction } from "@/model/Transaction";
import { PipelineStage } from "mongoose";

interface AnalyticsResult {
  _id: {
    category: string;
    type: "credit" | "debit";
    month?: number;
  };
  totalAmount: number;
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "year";
  const dateParam = searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  let start: Date, end: Date;

  switch (range) {
    case "day":
      start = startOfDay(date);
      end = endOfDay(date);
      break;
    case "week":
      start = startOfWeek(date, { weekStartsOn: 1 });
      end = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case "month":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "year":
      start = startOfYear(date);
      end = endOfYear(date);
      break;
    default:
      start = startOfMonth(date);
      end = endOfMonth(date);
  }

  const pipeline: PipelineStage[] = [
    {
      $match: {
        transactionDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          category: "$category",
          type: "$transactionType",
          // month: { $month: "$transactionDate" },
        },
        totalAmount: { $sum: "$amount" },
      },
    },
    // { $sort: { "_id.month": 1 } },
  ];

  const results: AnalyticsResult[] =
    await Transaction.aggregate(pipeline).exec();
  console.log("results", results);

  const analytics: Record<string, { credit?: number; debit?: number }> = {};

  for (const r of results) {
    const category = r._id.category;
    const type = r._id.type;
    if (!analytics[category]) {
      analytics[category] = {};
    }
    analytics[category][type] = r.totalAmount;
  }

  return NextResponse.json(analytics);
}
