"use client";

import React from "react";
import { AgCharts } from "ag-charts-react";
import {
  AgBarMiniChartSeriesOptions,
  AgChartLegendOptions,
  AgChartOptions,
  AgNodeClickEvent,
} from "ag-charts-community";
import { useSearchParams } from "next/navigation";
import { AnaylyticsRow, BarChartDataRow } from "./types";
import useNavigateToTransactionsByCategory from "./useNavigateToTransactionsByCategory";

interface AnalyticsChartProps {
  data: AnaylyticsRow[] | BarChartDataRow[];
  keys?: string[];
  date: Date | null;
}

export default function AnalyticsChart({
  data,
  keys,
  date,
}: AnalyticsChartProps) {
  const searchParams = useSearchParams();
  const navigateToTransactionsByCategory =
    useNavigateToTransactionsByCategory(date);
  const chart = searchParams.get("chart") || "pie";

  const agLegend: AgChartLegendOptions = {
    enabled: true,
    position: "bottom",
  };

  const pieChartOptions: AgChartOptions = {
    series: [
      {
        type: "pie",
        angleKey: "amount",
        sectorLabelKey: "amount",
        calloutLabelKey: "category",
        listeners: {
          nodeClick: (
            _event: AgNodeClickEvent<
              "nodeClick",
              { category: string; amount: number }
            >,
          ) => {
            navigateToTransactionsByCategory(_event.datum);
          },
        },
      },
    ],
    title: {
      text: "Analytics Pie Chart",
    },
    legend: agLegend,
  };

  const barSeriesForYear = keys
    ? keys
        .map((eachKey) => {
          return {
            type: "bar",
            xKey: "xKey",
            yKey: eachKey,
            yName: eachKey,
            stacked: true,
            stackGroup: eachKey === "income" ? "income" : "expense",
          } as AgBarMiniChartSeriesOptions;
        })
        .filter((eachData) => eachData !== null)
    : [];

  const barChartOptions: AgChartOptions = {
    series: barSeriesForYear,
    title: {
      text: "Analytics Bar Chart",
    },
    // legend: agLegend,
  };

  let chartOptions: AgChartOptions;
  if (chart === "bar") {
    chartOptions = { ...barChartOptions, data };
  } else {
    chartOptions = { ...pieChartOptions, data };
  }

  return (
    <div className="grid h-full">
      <AgCharts options={chartOptions} />
    </div>
  );
}
