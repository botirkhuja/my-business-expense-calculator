import React from "react";
import { getAnalyticsData, getAvailableYearsAndMonths } from "./actions";
import AnalyticsChart from "./AnalyticsChart"; // Client component
import { YearSelector } from "./YearSelector";
import AnalyticsViewSelector from "./AnalyticsViewSelector";
import { AnalyticsRange } from "./types";
import MonthSelector from "./MonthSelector";
import AnalyticsChartTypeSelector from "./AnalyticsChartTypeSelector";
import { getYear } from "date-fns";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    range: AnalyticsRange;
    year?: string;
    month?: string;
    chart?: string;
  }>;
}) {
  console.log("search params", await searchParams);
  const { range, year, month, chart } = await searchParams;
  const availableYears = await getAvailableYearsAndMonths();
  const date: Date = new Date();
  const selectedYear = getYear(date);
  if (!availableYears.find((y) => y.year === selectedYear)) {
    date.setFullYear(availableYears[0].year);
  }
  if (year) {
    date.setFullYear(Number(year));
  }

  if (month) {
    date.setMonth(Number(month) - 1);
  }

  // Fetch data on the server
  const analyticsResponse = await getAnalyticsData({
    date,
    range,
    chart,
  });

  return (
    <main className="p-4" style={{ height: "75vh" }}>
      <h1>Analytics Page</h1>
      <p>This chart shows the distribution of data from your analytics.</p>
      <AnalyticsChartTypeSelector />
      <AnalyticsViewSelector />
      <YearSelector />
      {range === "month" && <MonthSelector />}
      {/* Pass data as a prop to the client component */}
      <AnalyticsChart
        data={analyticsResponse.data}
        keys={analyticsResponse.keys}
        date={date}
      />
    </main>
  );
}
