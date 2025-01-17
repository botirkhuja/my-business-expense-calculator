import { ICategory } from "@/model/Category";
import { ColDef, ValueFormatterParams } from "ag-grid-community";
import { dateFormatter } from "./DateFormatter";
import { TransactionRecord } from "@/model/Transaction";
import RowActionsOptionSelector from "./RowActionsOptionSelector";

function CurrencyCellRendererUSD(
  params: ValueFormatterParams<TransactionRecord, string>,
) {
  const { value } = params;

  if (!value) {
    return "$0.00";
  }

  const inrFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
  return inrFormat.format(parseFloat(value));
}

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
export const COLUMN_DEFS: ColDef[] = [
  {
    headerName: "Card #",
    field: "cardNumber",
    filter: "agTextColumnFilter",
    width: 100,
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
    cellDataType: "number",
    valueFormatter: CurrencyCellRendererUSD,
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
    editable: true,
    cellEditor: "agSelectCellEditor",
  },
  {
    headerName: "Type",
    field: "transactionType",
    filter: "agTextColumnFilter",
  },
  {
    headerName: "Eval Type",
    field: "evaluvatedTransactionType",
    filter: "agTextColumnFilter",
  },
  {
    headerName: "Post Date",
    field: "postDate",
    valueFormatter: dateFormatter,
    filter: "agDateColumnFilter",
  },
  { headerName: "Memo", field: "memo", filter: "agTextColumnFilter" },
  {
    headerName: "Upload Receipt",
    cellRenderer: RowActionsOptionSelector,
  },
];
