"use client";

import React from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";
import { AnalyticsData } from "./actions";

interface AnalyticsChartProps {
  data: AnalyticsData[];
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const pieChartOptions: AgChartOptions = {
    data,
    series: [
      {
        type: "pie",
        angleKey: "amount",
        sectorLabelKey: "amount",
        calloutLabelKey: "category",
      },
    ],
    title: {
      text: "Analytics Pie Chart",
    },
    legend: {
      position: "right",
    },
  };

  return (
    <div className="grid">
      <AgCharts options={pieChartOptions} />
    </div>
  );
}
