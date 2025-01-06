"use client";

import React from "react";
import { AgCharts } from "ag-charts-react";
import {
  AgBarMiniChartSeriesOptions,
  AgChartLegendOptions,
  AgChartOptions,
  AgNodeClickEvent,
} from "ag-charts-community";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterModel } from "ag-grid-community";
import { BarChartDataRow } from "./types";
import { getMonth, getYear, endOfMonth, startOfMonth } from "date-fns";

interface AnalyticsChartProps {
  data: BarChartDataRow[];
  keys?: string[];
  date: Date | null;
}

export default function AnalyticsChart({
  data,
  keys,
  date,
}: AnalyticsChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
            let filters: FilterModel = {
              evaluvatedCategory: {
                filter: _event.datum.category,
                filterType: "text",
                type: "contains",
              },
            };

            if (searchParams.get("range") === "month" && date) {
              filters = {
                ...filters,
                transactionDate: {
                  dateFrom: `${getYear(date)}-${getMonth(date)}-${startOfMonth(date)} 00:00:00`,
                  dateTo: `${getYear(date)}-${getMonth(date)}-${endOfMonth(date)} 00:00:00`,
                  filterType: "date",
                  type: "inRange",
                },
              };
              console.log("adding range", filters);
            }

            const filtersString = JSON.stringify(filters);
            const urlSearchParams = new URLSearchParams();
            urlSearchParams.set("filters", filtersString);

            router.push(`transactions?${urlSearchParams.toString()}`);
            console.log("node click", _event.datum);
          },
        },
      },
    ],
    title: {
      text: "Analytics Pie Chart",
    },
    legend: agLegend,
    // listeners: {
    //   seriesNodeClick: (
    //     _event: AgNodeClickEvent<"seriesNodeClick", { data: string }>,
    //   ) => {
    //     console.log("series node click", _event);
    //   },
    //   click: (_event: AgChartClickEvent) => {
    //     console.log("click", _event);
    //   },
    //   doubleClick: (_event: AgChartDoubleClickEvent) => {
    //     console.log("double click", _event);
    //   },
    // },
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

  console.log("chart data", data);

  return (
    <div className="grid h-full">
      <AgCharts options={chartOptions} />
    </div>
  );
}
