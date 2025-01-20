"use client";

import { AnaylyticsRow } from "../types";
import useNavigateToTransactionsByCategory from "../useNavigateToTransactionsByCategory";

export default function AnalyticsSummaryTableViewCategoryTransactionsButton(props: {
  data: AnaylyticsRow;
}) {
  const navigateToTransactionsByCategory =
    useNavigateToTransactionsByCategory();
  return (
    <button
      onClick={() => {
        if (props.data) {
          navigateToTransactionsByCategory(props.data);
        }
      }}
    >
      {props.data.category}
    </button>
  );
}
