"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

const months = [
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
];

export default function MonthSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const month =
    searchParams.get("month") || (new Date().getMonth() + 1).toString();

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value;
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set("month", month);
    router.push(`?${urlSearchParams.toString()}`);
  };

  return (
    <div>
      <label htmlFor="month">Month:</label>
      <select
        name="month"
        id="month"
        value={month}
        onChange={handleMonthChange}
      >
        {months.map((month, index) => (
          <option key={index} value={index + 1}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
}
