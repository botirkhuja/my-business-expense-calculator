"use client"; // Needed because we'll fetch data at runtime and use React states

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
import { TransactionRecord } from "@/model/TransactionRecord";
import {
  ColDef,
  AllCommunityModule,
  ModuleRegistry,
  GridReadyEvent,
  FilterModel,
  PaginationChangedEvent,
  FirstDataRenderedEvent,
  SortChangedEvent,
  ColumnState,
  FilterChangedEvent,
} from "ag-grid-community";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const DEFAULT_PAGE_SIZE = 20;

const TransactionsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const gridRef = useRef<AgGridReact>(null);

  const [rowData, setRowData] = useState<TransactionRecord[]>([]);
  const firstDataRendered = useRef(false);

  // Define our column definitions for the ag-Grid
  const columnDefs: ColDef[] = useMemo(
    () => [
      { headerName: "Card Number", field: "cardNumber" },
      {
        headerName: "Post Date",
        field: "postDate",
        valueFormatter: dateFormatter,
      },
      {
        headerName: "Transaction Date",
        field: "transactionDate",
        valueFormatter: dateFormatter,
      },
      { headerName: "Ref ID", field: "refId" },
      { headerName: "Description", field: "description" },
      { headerName: "Amount", field: "amount" },
      { headerName: "Merchant", field: "merchant" },
      { headerName: "Type", field: "transactionType" },
      { headerName: "Category", field: "category" },
      { headerName: "Memo", field: "memo" },
    ],
    [],
  );

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    filterParams: {
      buttons: ["apply", "clear", "reset"],
      debounceMs: 200,
      maxNumConditions: 1,
      trimInput: true,
    },
  };

  // -----------------------------
  // 1. Parse query params (filters, sort, page)
  // -----------------------------
  // We'll store them as JSON strings: e.g. ?filters={"description":{"filter":"abc"}}
  const currentFilterModel = useMemo(() => {
    const filterModel: FilterModel = {};
    searchParams.entries().forEach(([key, value]) => {
      const column = columnDefs.find((columnDef) => columnDef.field === key);
      if (!column) return;

      const filterValues = value.split(",");
      filterModel[key] = {
        type: filterValues[1],
        filter: filterValues[0],
      };
    });
    return filterModel;
  }, [searchParams, columnDefs]);

  // Simple date formatter function for valueFormatter
  function dateFormatter(params: { value: string }) {
    const value = params.value;
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString();
  }

  // Parse search params
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSortField = searchParams.get("sortField") || "";
  const initialSortOrder = (searchParams.get("sortOrder") || "") as
    | "asc"
    | "desc";
  // const initialCategoryFilter = searchParams.get("category") || "";

  // On grid ready, set initial sort/filter/pagination state from URL
  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      console.log("Grid ready");

      // Fetch transaction data from API
      // Ensure you have an API route like /api/transactions that returns a JSON array of TransactionRecord
      fetch("/api/transactions")
        .then((res) => res.json())
        .then((data: TransactionRecord[]) => {
          setRowData(data);
        })
        .catch((err) => console.error(err));

      const api = params.api;

      // Set initial sort model if any
      if (initialSortField && initialSortOrder) {
        api.applyColumnState({
          state: [{ colId: initialSortField, sort: initialSortOrder }],
          applyOrder: true,
        });
      }

      // Set initial filter model if any

      if (Object.keys(currentFilterModel).length > 0) {
        api.setFilterModel(currentFilterModel);
      }
    },
    [initialSortField, initialSortOrder, currentFilterModel],
  );

  // A helper to update the URL without a full reload
  const updateURLParams = useCallback(
    (updated: Record<string, string | undefined>) => {
      const currentParams = new URLSearchParams(searchParams.toString());

      let changed = false;

      for (const key in updated) {
        const val = updated[key];
        const oldVal = currentParams.get(key);
        if (val === undefined || val === "") {
          // If val is empty, remove param
          if (oldVal !== null) {
            currentParams.delete(key);
            changed = true;
          }
        } else {
          // If new param differs, set it
          if (oldVal !== val) {
            currentParams.set(key, val);
            changed = true;
          }
        }
      }

      // Only update if something actually changed
      if (changed) {
        router.replace(`?${currentParams.toString()}`, { scroll: false });
      }
    },
    [router, searchParams],
  );

  // Whenever sort or filter changes, update the URL
  const onSortChanged = useCallback(
    (params: SortChangedEvent<TransactionRecord>) => {
      const api = params.api;
      if (!api) return;
      // console.log("onSortChanged", params);
      const sortModel = params.columns;
      let sortField: string | undefined = "";
      let sortOrder: "asc" | "desc" | undefined;
      if (sortModel && sortModel.length > 0) {
        const column = sortModel.at(-1) as never as ColumnState;
        sortOrder = column.sort || undefined;
        sortField = sortOrder ? column.colId || undefined : "";
      }
      updateURLParams({ sortField, sortOrder });
    },
    [updateURLParams],
  );

  const onFilterChanged = useCallback(
    (params: FilterChangedEvent) => {
      console.log("onFilterChanged params", params);
      console.log("onFilterChanged filter model", params.api.getFilterModel());
      const api = params.api;
      if (!api) return;
      const filterModel = api.getFilterModel();
      const stringifiedFilterModel = JSON.stringify(filterModel);
      const filter: Record<string, string | undefined> = Object.entries(
        filterModel,
      ).reduce(
        (res, [key, value]) => {
          let filterValue = "";
          if (value.filter) {
            filterValue = `${value.filter},${value.type}`;
          }
          return { ...res, [key]: filterValue };
        },
        {} as Record<string, string>,
      );

      Object.keys(currentFilterModel).forEach((key) => {
        if (!filter[key]) {
          filter[key] = "";
        }
      });
      console.log(currentFilterModel);
      updateURLParams({
        filters: stringifiedFilterModel === "{}" ? "" : stringifiedFilterModel,
      });
    },
    [updateURLParams, currentFilterModel],
  );

  const onPaginationChanged = useCallback(
    (params: PaginationChangedEvent) => {
      // console.log("pagination changed", params);
      const api = params?.api;
      if (!api) return;
      // paginationGetCurrentPage returns 0-based index
      const currentPage = api.paginationGetCurrentPage() + 1;

      if (firstDataRendered && currentPage !== initialPage) {
        // initialPage = currentPage;
        updateURLParams({ page: currentPage.toString() });
      }
    },
    [initialPage, firstDataRendered, updateURLParams],
  );

  const onFirstDataRendered = useCallback(
    (params: FirstDataRenderedEvent) => {
      firstDataRendered.current = true;
      // Set pagination page if provided
      // Pages in ag-Grid pagination start at 0, so subtract 1 from initialPage
      if (initialPage > 1) {
        params.api.paginationGoToPage(initialPage - 1);
      }
    },
    [initialPage],
  );

  return (
    <div className="ag-theme-alpine" style={{ height: "80vh", width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={DEFAULT_PAGE_SIZE}
        onGridReady={onGridReady}
        onSortChanged={onSortChanged}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  );
};

export default TransactionsPage;
