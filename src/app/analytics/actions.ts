"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/model/Transaction";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { PipelineStage } from "mongoose";
import { ICategory } from "@/model/Category";

interface AnalyticsResult {
  _id: {
    evaluvatedCategory: ICategory[];
    type: "credit" | "debit";
    month?: number;
  };
  totalAmount: number;
}

export interface AnalyticsData {
  category: string;
  amount: number;
}

// This could call /api/analytics or any external server
export async function getAnalyticsData() {
  await connectToDatabase();

  // const { searchParams } = new URL(req.url);
  const searchParams = new URLSearchParams();
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

  console.log("start", start);
  console.log("end", end);
  const pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: "categories",
        localField: "evaluvatedCategory",
        foreignField: "_id",
        as: "evaluvatedCategory",
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    {
      $match: {
        transactionDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          evaluvatedCategory: "$evaluvatedCategory",
          type: "$transactionType",
          // month: { $month: "$transactionDate" },
        },
        totalAmount: { $sum: { $toDouble: "$amount" } },
      },
    },
    // { $sort: { "_id.month": 1 } },
  ];

  const results: AnalyticsResult[] =
    await Transaction.aggregate(pipeline).exec();
  // console.log("results", results);

  const analytics: Record<string, { credit?: number; debit?: number }> = {};

  for (const r of results) {
    console.log("r", r._id.evaluvatedCategory);
    const category = r._id.evaluvatedCategory.at(0)?.name || "Uncategorized";
    const type = r._id.type;
    if (!analytics[category]) {
      analytics[category] = {};
    }
    analytics[category][type] = r.totalAmount;
  }

  // const categories = await getCategories();
  console.log("analytics", analytics);
  const result = Object.entries(analytics).map(([key, value]) => {
    // console.log("value", value);
    // console.log("key", key);
    const amount = value?.debit || 0 - (value?.credit || 0);
    // console.log("amount", amount);
    return {
      category: key || "Uncategorized",
      amount: Math.abs(amount),
    };
  });

  return result;
}
