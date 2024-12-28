import { ICategory } from "@/model/Category";
import { ColDef, ValueFormatterParams } from "ag-grid-community";
import { dateFormatter } from "./DateFormatter";

export const defaultColDef: ColDef = {
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

// Define our column definitions for the ag-Grid
export const columnDefs: ColDef[] = [
  {
    headerName: "Card Number",
    field: "cardNumber",
    filter: "agTextColumnFilter",
  },

  {
    headerName: "Transaction Date",
    field: "transactionDate",
    valueFormatter: dateFormatter,
    filter: "agDateColumnFilter",
  },
  {
    headerName: "Description",
    field: "description",
    filter: "agTextColumnFilter",
  },
  {
    headerName: "Amount",
    field: "amount",
    filter: "agNumberColumnFilter",
    type: "numericColumn",
    valueFormatter: (params) => `$${params.value}`,
  },
  {
    headerName: "Merchant",
    field: "merchant",
    filter: "agTextColumnFilter",
  },
  {
    headerName: "Category",
    field: "category",
    filter: "agTextColumnFilter",
  },
  {
    headerName: "Internal Category",
    field: "evaluvatedCategory",
    filter: "agTextColumnFilter",
    valueFormatter: (params: ValueFormatterParams<Partial<ICategory>>) => {
      return params.value?.name || "Uncategorized";
    },
  },
  {
    headerName: "Type",
    field: "transactionType",
    filter: "agTextColumnFilter",
  },
  {
    headerName: "Post Date",
    field: "postDate",
    valueFormatter: dateFormatter,
    filter: "agDateColumnFilter",
  },
  { headerName: "Memo", field: "memo", filter: "agTextColumnFilter" },
  { headerName: "Ref ID", field: "refId", filter: "agTextColumnFilter" },
];
