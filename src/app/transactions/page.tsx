"use client"; // Needed because we'll fetch data at runtime and use React states

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  AllCommunityModule,
  ModuleRegistry,
  GridReadyEvent,
  FilterModel,
  PaginationChangedEvent,
  FirstDataRenderedEvent,
  SortChangedEvent,
  ColumnState,
  FilterChangedEvent,
  CellValueChangedEvent,
} from "ag-grid-community";
import { TransactionRecord } from "@/model/Transaction";
import { COLUMN_DEFS, defaultColDef } from "./ColumnDefs";
import {
  changeTransactionCategory,
  getTransactions,
  recategorizeTransactions,
} from "./actions";
import { getCategories } from "../categories/actions";
import { ICategory } from "@/model/Category";
import AddNewTransactionLink from "./AddNewTransactionLink";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const DEFAULT_PAGE_SIZE = 50;

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const gridRef = useRef<AgGridReact>(null);

  const [rowData, setRowData] = useState<TransactionRecord[]>([]);
  const [colDefs, setColDefs] = useState(COLUMN_DEFS);
  const firstDataRendered = useRef(false);

  const pageParam = searchParams.get("page");

  // Convert `filters` and `sort` from JSON string to objects
  const initialFilterModel: FilterModel = useMemo(() => {
    const filtersParam = searchParams.get("filters");
    if (!filtersParam) return {};
    try {
      return JSON.parse(filtersParam);
    } catch (err) {
      console.error("Invalid filters JSON in URL:", err);
      return {};
    }
  }, [searchParams]);

  const initialSortModel: ColumnState[] = useMemo(() => {
    const sortParam = searchParams.get("sort");
    if (!sortParam) return [];
    try {
      if (sortParam) {
        return JSON.parse(sortParam);
      }
    } catch (err) {
      console.error("Invalid sort JSON in URL:", err);
      return [];
    }
  }, [searchParams]);

  // Default to page 1 if none provided
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;

  useEffect(() => {
    const api = gridRef.current?.api;
    const fetchCagetories = async () => {
      getCategories().then((res) => {
        const newColumnDefs = [...COLUMN_DEFS];
        const evaluvatedCategoryColumnDefIdx = newColumnDefs.findIndex(
          (colDef) => colDef.field === "evaluvatedCategory",
        );
        if (evaluvatedCategoryColumnDefIdx !== -1) {
          const evaluvatedCategoryColumnDef = {
            ...newColumnDefs[evaluvatedCategoryColumnDefIdx],
          };

          evaluvatedCategoryColumnDef.cellEditorParams = {
            values: res,
          };
          evaluvatedCategoryColumnDef.cellEditorParams.values.push({
            _id: null,
            name: "Uncategorized",
          });

          newColumnDefs[evaluvatedCategoryColumnDefIdx] =
            evaluvatedCategoryColumnDef;

          // update the column definition
          setColDefs(newColumnDefs);
        }
      });
    };

    fetchCagetories();

    // Set initial filter model if any
    if (api && initialFilterModel) {
      api.setFilterModel(initialFilterModel);
    }

    // Set initial sort model if any
    if (api && initialSortModel && initialSortModel.length > 0) {
      api.applyColumnState({
        state: initialSortModel,
        applyOrder: true,
      });
    }
    return () => {};
  }, [initialFilterModel, initialSortModel, gridRef]);

  // On grid ready, set initial sort/filter/pagination state from URL
  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      const api = params.api;

      console.log("Grid ready");
      // Fetch transactions
      getTransactions()
        .then((res) => {
          console.log("transactions res", res);
          setRowData(res.transactions);
        })
        .catch((err) => console.error(err));

      // Set initial sort model if any
      if (initialSortModel && initialSortModel.length > 0) {
        api.applyColumnState({
          state: initialSortModel,
          applyOrder: true,
        });
      }

      // Set initial filter model if any
      if (initialFilterModel && Object.keys(initialFilterModel).length > 0) {
        api.setFilterModel(initialFilterModel);
      }
    },
    [initialSortModel, initialFilterModel],
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
      const sortModel = params.columns as never as ColumnState[];
      // console.log("sort model", params.api.getColumnState());
      const stringifiedSortModel = JSON.stringify(
        sortModel
          .filter((c) => c.sort)
          .map((c) => ({ colId: c.colId, sort: c.sort })),
      );
      if (sortModel && sortModel.length > 0) {
        updateURLParams({ sort: stringifiedSortModel });
      } else {
        updateURLParams({ sort: undefined });
      }
    },
    [updateURLParams],
  );

  const onFilterChanged = useCallback(
    (params: FilterChangedEvent) => {
      const api = params.api;
      if (!api) return;
      const filterModel = api.getFilterModel();
      const stringifiedFilterModel = JSON.stringify(filterModel);
      updateURLParams({
        filters: stringifiedFilterModel === "{}" ? "" : stringifiedFilterModel,
      });
    },
    [updateURLParams],
  );

  const onPaginationChanged = useCallback(
    (params: PaginationChangedEvent) => {
      // console.log("pagination changed", params);
      const api = params?.api;
      if (!api) return;
      // paginationGetCurrentPage returns 0-based index
      const currentPage = api.paginationGetCurrentPage() + 1;

      if (firstDataRendered.current === true && currentPage !== initialPage) {
        // initialPage = currentPage;
        updateURLParams({
          page: currentPage !== 1 ? currentPage.toString() : undefined,
        });
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

  const rerunCategorization = async () => {
    await recategorizeTransactions();
  };

  const handleCellValueChange = (params: CellValueChangedEvent<ICategory>) => {
    console.log(params);
    if (params.oldValue?._id !== params.newValue?._id) {
      changeTransactionCategory(params.data._id, params.newValue._id);
    }
  };

  return (
    <main>
      <h1>Transactions Page</h1>
      <p>Here you can view and manage your transactions.</p>
      <div className="flex gap-2 p-5">
        <button className="px-4 py-2 bg-gray-500" onClick={rerunCategorization}>
          Rerun Categorization
        </button>
        <AddNewTransactionLink />
      </div>
      <div
        className="ag-theme-alpine"
        style={{ height: "70vh", width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={DEFAULT_PAGE_SIZE}
          onGridReady={onGridReady}
          onSortChanged={onSortChanged}
          onFilterChanged={onFilterChanged}
          onPaginationChanged={onPaginationChanged}
          onFirstDataRendered={onFirstDataRendered}
          onCellValueChanged={handleCellValueChange}
        />
      </div>
    </main>
  );
}
