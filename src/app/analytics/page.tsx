import React from "react";
import { getAnalyticsData, getAvailableYearsAndMonths } from "./actions";
import AnalyticsChart from "./AnalyticsChart"; // Client component
import { YearSelector } from "./YearSelector";
import AnalyticsViewSelector from "./AnalyticsViewSelector";
import { AnalyticsRange } from "./types";
import MonthSelector from "./MonthSelector";
import AnalyticsChartTypeSelector from "./AnalyticsChartTypeSelector";
import { getYear } from "date-fns";
import AnalyticsSummaryTableLink from "./SummaryTableLink";

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
    <main className="p-4 flex flex-col gap-2" style={{ height: "75vh" }}>
      <h1>Analytics Page</h1>
      <div>
        <AnalyticsSummaryTableLink />
      </div>
      <div className="flex gap-6">
        <AnalyticsChartTypeSelector />
        <AnalyticsViewSelector />
        <YearSelector />
      </div>
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
