"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AnalyticsChartTypeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chart = searchParams.get("chart") || "pie";

  const handleViewChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const chart = event.target.value;
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set("chart", chart);
    router.push(`?${urlSearchParams.toString()}`);
  };

  return (
    <div>
      <label htmlFor="view-selector">Chart Selector</label>
      <select id="view-selector" onChange={handleViewChange} value={chart}>
        <option value="pie">Pie</option>
        <option value="bar">Bar</option>
      </select>
    </div>
  );
}
