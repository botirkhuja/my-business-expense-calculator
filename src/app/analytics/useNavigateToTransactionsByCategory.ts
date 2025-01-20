import { FilterModel } from "ag-grid-community";
import { useRouter, useSearchParams } from "next/navigation";
import { AnaylyticsRow } from "./types";
import { endOfMonth, getMonth, getYear, startOfMonth } from "date-fns";

export default function useNavigateToTransactionsByCategory(
  date?: Date | null,
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToTransactionsByDataCategory = (data: AnaylyticsRow) => {
    let filters: FilterModel = {
      evaluvatedCategory: {
        filter: data.category,
        filterType: "text",
        type: "contains",
      },
    };

    if (searchParams.get("range") === "month" && date) {
      filters = {
        ...filters,
        transactionDate: {
          dateFrom: `${getYear(date)}-${getMonth(date) + 1}-${startOfMonth(date)} 00:00:00`,
          dateTo: `${getYear(date)}-${getMonth(date) + 1}-${endOfMonth(date)} 00:00:00`,
          filterType: "date",
          type: "inRange",
        },
      };
      console.log("adding range", filters);
    }

    const filtersString = JSON.stringify(filters);
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set("filters", filtersString);

    router.push(`/transactions?${urlSearchParams.toString()}`);
  };

  return navigateToTransactionsByDataCategory;
}
