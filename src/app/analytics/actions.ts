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
  getYear,
  getMonth,
} from "date-fns";
import { PipelineStage } from "mongoose";
import { ICategory } from "@/model/Category";
import { AnalyticsRange, BarChartDataRow } from "./types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

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

interface Props {
  range?: AnalyticsRange;
  date: Date | null;
  chart?: string;
}

// This could call /api/analytics or any external server
export async function getAnalyticsData(props: Props) {
  await connectToDatabase();
  const years = await getAvailableYearsAndMonths();

  const range = props.range || "year";
  const chart = props.chart || "pie";
  const date = props.date ? props.date : new Date();

  if (props.date === null) {
    const availableFirstYear = years.at(0)?.year;
    if (availableFirstYear) {
      date.setFullYear(availableFirstYear);
    }
  }

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

  let pipeline: PipelineStage[] = [];
  const basePipeline: PipelineStage[] = [
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
              key: 1,
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
  ];

  if (chart === "bar") {
    pipeline = [
      ...basePipeline,
      {
        $group: {
          _id: {
            evaluvatedCategory: "$evaluvatedCategory",
            // type: "$evaluvatedTransactionType",
            month: { $month: "$transactionDate" },
          },
          totalAmount: { $sum: { $toDouble: "$amount" } },
        },
      },
      { $sort: { "_id.month": 1 } },
    ];
  } else if (range === "year") {
    pipeline = [
      ...basePipeline,
      {
        $group: {
          _id: {
            evaluvatedCategory: "$evaluvatedCategory",
            type: "$evaluvatedTransactionType",
            // month: { $month: "$transactionDate" },
          },
          totalAmount: { $sum: { $toDouble: "$amount" } },
        },
      },
      // { $sort: { "_id.month": 1 } },
    ];
  } else if (range === "month") {
    pipeline = [
      ...basePipeline,
      {
        $group: {
          _id: {
            evaluvatedCategory: "$evaluvatedCategory",
            type: "$evaluvatedTransactionType",
            month: { $month: "$transactionDate" },
          },
          totalAmount: { $sum: { $toDouble: "$amount" } },
        },
      },
    ];
    pipeline.push({ $sort: { "_id.month": 1 } });
  }

  const results: AnalyticsResult[] =
    await Transaction.aggregate(pipeline).exec();
  // console.log("results", results);

  const analytics: Record<string, any> = {};
  let result: BarChartDataRow[] = [];

  if (chart === "bar" && range === "year") {
    result = Array.from({ length: 12 });
    const keysSet = new Set<string>();
    for (const r of results) {
      const { evaluvatedCategory, month } = r._id;
      const categoryKey = evaluvatedCategory.at(0)?.key || "uncategorized";
      keysSet.add(categoryKey);
      const totalAmount = r.totalAmount;
      const monthResult = result[Number(month) - 1];
      if (monthResult) {
        monthResult[categoryKey] = totalAmount;
        continue;
      }

      result[Number(month) - 1] = {
        [categoryKey]: totalAmount,
        xKey: MONTHS[Number(month) - 1],
      };
    }
    return {
      data: result.map((r) => {
        for (const key of keysSet) {
          if (!r[key]) {
            r[key] = 0;
          }
        }
        return r;
      }),
      start,
      end,
      keys: Array.from(keysSet),
    };
  } else if (chart === "bar" && range === "month") {
    const keysSet = new Set<string>();
    result = [];
    for (const r of results) {
      const { evaluvatedCategory } = r._id;
      const categoryKey = evaluvatedCategory.at(0)?.key || "uncategorized";
      keysSet.add(categoryKey);
      const totalAmount = r.totalAmount;
      result.push({
        xKey: categoryKey,
        [categoryKey]: totalAmount,
      });
    }
    return {
      data: result,
      start,
      end,
      keys: Array.from(keysSet),
    };
  } else if (range === "year" || range === "month") {
    for (const r of results) {
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
      const amount = (value?.debit || 0) - (value?.credit || 0);
      // console.log(key, value?.debit, "-", value?.credit, "=", amount);
      // console.log("amount", amount);
      return {
        category: key || "Uncategorized",
        amount: Math.abs(amount),
      };
    });
    return { data: result, start, end };
  }

  // console.log("result", result);
  return { data: [], start, end };
}

export async function getAvailableYearsAndMonths() {
  await connectToDatabase();
  const yearsMap = new Map<number, Set<number>>();
  const years = await Transaction.distinct("transactionDate", {
    transactionDate: { $exists: true },
  });
  for (const date of years) {
    if (yearsMap.has(getYear(date))) {
      yearsMap.get(getYear(date))?.add(getMonth(date));
    } else {
      yearsMap.set(getYear(date), new Set([getMonth(date)]));
    }
  }
  return Array.from(yearsMap).map((data) => ({
    year: data[0],
    months: Array.from(data[1]),
  }));
}
