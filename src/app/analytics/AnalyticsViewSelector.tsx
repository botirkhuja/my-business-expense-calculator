"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AnalyticsViewSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "year";
  const handleViewChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const range = event.target.value;
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set("range", range);
    router.push(`?${urlSearchParams.toString()}`);
  };

  return (
    <div>
      <label htmlFor="view-selector">View Selector</label>
      <select id="view-selector" onChange={handleViewChange} value={range}>
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="all">All</option>
      </select>
    </div>
  );
}
