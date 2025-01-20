import { getYear } from "date-fns";
import { getAnalyticsData, getAvailableYearsAndMonths } from "../actions";
import { AnalyticsRange, AnaylyticsRow } from "../types";
import AnalyticsSummaryTable from "./SummaryTable";

export default async function AnalyticsSummaryTablePage({
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

  console.log(analyticsResponse);

  return (
    <main className="p-4">
      <AnalyticsSummaryTable data={analyticsResponse.data as AnaylyticsRow[]} />
    </main>
  );
}
