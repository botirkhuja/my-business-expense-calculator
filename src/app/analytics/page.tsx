import React from "react";
import { getAnalyticsData } from "./actions";
import AnalyticsChart from "./AnalyticsChart"; // Client component

export default async function AnalyticsPage() {
  // Fetch data on the server
  const analyticsData = await getAnalyticsData();

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Analytics Page</h1>
      <p>This chart shows the distribution of data from your analytics.</p>
      {/* Pass data as a prop to the client component */}
      <AnalyticsChart data={analyticsData} />
    </main>
  );
}
