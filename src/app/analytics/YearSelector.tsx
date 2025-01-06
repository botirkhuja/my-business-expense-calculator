"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function YearSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedYear = searchParams.get("year") || "2024";
  const selectedYearNumber = Number(selectedYear);
  const years = Array.from(
    { length: 10 },
    (_, i) => selectedYearNumber - 5 + i,
  );

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set("year", year);
    router.push(`?${urlSearchParams.toString()}`);
  };

  return (
    <div>
      <label htmlFor="year">Year:</label>
      <select
        value={selectedYearNumber}
        name="year"
        onChange={handleYearChange}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
